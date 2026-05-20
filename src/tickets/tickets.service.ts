import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, STATUS_ORDER } from './ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { User, UserRole } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';
import { DependenciesService } from './dependencies.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketsRepo: Repository<Ticket>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly depsService: DependenciesService,
  ) {}

  async create(dto: CreateTicketDto, actorId?: number, actorName?: string): Promise<Ticket> {
    let assignee_id = dto.assignee_id ?? null;
    let autoAssigned = false;

    if (!assignee_id) {
      assignee_id = await this.autoAssign(dto.project_id);
      if (assignee_id) autoAssigned = true;
    }

    const ticket = this.ticketsRepo.create({ ...dto, assignee_id });
    const saved = await this.ticketsRepo.save(ticket);

    await this.auditService.log({
      action: AuditAction.CREATE,
      entity_type: AuditEntityType.TICKET,
      entity_id: saved.id,
      actor_id: actorId,
      actor: actorName ?? 'SYSTEM',
      metadata: { title: saved.title, project_id: saved.project_id },
    });

    if (autoAssigned) {
      await this.auditService.log({
        action: AuditAction.AUTO_ASSIGN,
        entity_type: AuditEntityType.TICKET,
        entity_id: saved.id,
        actor: 'SYSTEM',
        metadata: { assignee_id },
      });
    }

    return saved;
  }

  async findByProject(project_id: number): Promise<Ticket[]> {
    return this.ticketsRepo.find({ where: { project_id } });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto, actorId?: number, actorName?: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.status === TicketStatus.DONE) {
      throw new BadRequestException('Cannot update a ticket that is DONE');
    }

    if (dto.version !== undefined && dto.version !== ticket.version) {
      throw new ConflictException(
        'Ticket was modified by another user. Please refresh and try again.',
      );
    }

    if (dto.status && dto.status !== ticket.status) {
      this.validateStatusTransition(ticket.status, dto.status);

      // Block transition to DONE if unresolved blockers exist
      if (dto.status === TicketStatus.DONE) {
        const blocked = await this.depsService.hasUnresolvedBlockers(id);
        if (blocked) {
          throw new BadRequestException(
            'Cannot mark ticket as DONE: it has unresolved blockers',
          );
        }
      }
    }

    if (dto.priority && dto.priority !== ticket.priority) {
      ticket.is_overdue = false;
      ticket.escalation_reset = true;
    }

    Object.assign(ticket, dto);
    const saved = await this.ticketsRepo.save(ticket);

    await this.auditService.log({
      action: AuditAction.UPDATE,
      entity_type: AuditEntityType.TICKET,
      entity_id: saved.id,
      actor_id: actorId,
      actor: actorName ?? 'SYSTEM',
      metadata: dto,
    });

    return saved;
  }

  async remove(id: number, actorId?: number, actorName?: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepo.softRemove(ticket);

    await this.auditService.log({
      action: AuditAction.DELETE,
      entity_type: AuditEntityType.TICKET,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
    });
  }

  async restore(id: number, actorId?: number, actorName?: string): Promise<Ticket> {
    await this.ticketsRepo.restore(id);
    const ticket = await this.findOne(id);

    await this.auditService.log({
      action: AuditAction.RESTORE,
      entity_type: AuditEntityType.TICKET,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
    });

    return ticket;
  }

  async findDeleted(project_id: number): Promise<Ticket[]> {
    return this.ticketsRepo
      .createQueryBuilder('t')
      .withDeleted()
      .where('t.project_id = :project_id', { project_id })
      .andWhere('t.deleted_at IS NOT NULL')
      .getMany();
  }

  async getWorkload(project_id: number): Promise<{ userId: number; username: string; openTicketCount: number }[]> {
    const rows = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.assignee_id', 'userId')
      .addSelect('u.username', 'username')
      .addSelect('COUNT(t.id)', 'openTicketCount')
      .innerJoin(User, 'u', 'u.id = t.assignee_id')
      .where('t.project_id = :project_id', { project_id })
      .andWhere('t.status != :done', { done: TicketStatus.DONE })
      .andWhere('t.deleted_at IS NULL')
      .groupBy('t.assignee_id')
      .addGroupBy('u.username')
      .orderBy('openTicketCount', 'ASC')
      .getRawMany();

    return rows.map(r => ({
      userId: Number(r.userId),
      username: r.username,
      openTicketCount: Number(r.openTicketCount),
    }));
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private validateStatusTransition(from: TicketStatus, to: TicketStatus): void {
    const fromIdx = STATUS_ORDER.indexOf(from);
    const toIdx = STATUS_ORDER.indexOf(to);
    if (toIdx <= fromIdx) {
      throw new BadRequestException(
        `Invalid status transition: ${from} → ${to}. Status can only move forward.`,
      );
    }
  }

  async autoAssign(project_id: number): Promise<number | null> {
    const developers = await this.usersRepo.find({
      where: { role: UserRole.DEVELOPER },
      order: { created_at: 'ASC' },
    });
    if (!developers.length) return null;

    const workloadMap = new Map<number, number>(developers.map(d => [d.id, 0]));

    const openCounts = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.assignee_id', 'assignee_id')
      .addSelect('COUNT(t.id)', 'count')
      .where('t.project_id = :project_id', { project_id })
      .andWhere('t.status != :done', { done: TicketStatus.DONE })
      .andWhere('t.deleted_at IS NULL')
      .andWhere('t.assignee_id IN (:...ids)', { ids: developers.map(d => d.id) })
      .groupBy('t.assignee_id')
      .getRawMany();

    for (const row of openCounts) {
      workloadMap.set(Number(row.assignee_id), Number(row.count));
    }

    let minLoad = Infinity;
    let chosen: number | null = null;
    for (const dev of developers) {
      const load = workloadMap.get(dev.id) ?? 0;
      if (load < minLoad) {
        minLoad = load;
        chosen = dev.id;
      }
    }
    return chosen;
  }
}
