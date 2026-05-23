import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '../tickets/ticket.entity';
import { Project } from '../projects/project.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';

const CSV_FIELDS = ['id', 'title', 'description', 'status', 'priority', 'type', 'assignee_id'];

const VALID_STATUSES = Object.values(TicketStatus);
const VALID_PRIORITIES = Object.values(TicketPriority);
const VALID_TYPES = Object.values(TicketType);

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    private readonly auditService: AuditService,
  ) {}

  async exportTickets(projectId: number, actorId?: number): Promise<string> {
    const tickets = await this.ticketsRepo.find({ where: { project_id: projectId } });

    const rows = tickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description ?? '',
      status: t.status,
      priority: t.priority,
      type: t.type,
      assignee_id: t.assignee_id ?? '',
    }));

    const csv = stringify(rows, {
      header: true,
      columns: CSV_FIELDS,
      quoted: true,
    });

    await this.auditService.log({
      action: AuditAction.EXPORT,
      entity_type: AuditEntityType.TICKET,
      actor_id: actorId,
      metadata: { project_id: projectId, count: tickets.length },
    });

    return csv;
  }

  async importTickets(
    projectId: number,
    fileBuffer: Buffer,
    actorId?: number,
  ): Promise<{ created: number; failed: number; errors: string[] }> {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    let records: any[];

    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      });
    } catch (e) {
      throw new BadRequestException(`Invalid CSV format: ${e.message}`);
    }

    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // 1-indexed + header row

      try {
        this.validateRow(row, rowNum);

        const ticket = this.ticketsRepo.create({
          title: row.title,
          description: row.description || null,
          status: (row.status as TicketStatus) || TicketStatus.TODO,
          priority: (row.priority as TicketPriority) || TicketPriority.MEDIUM,
          type: row.type as TicketType,
          project_id: projectId,
          assignee_id: row.assignee_id ? Number(row.assignee_id) : null,
        });

        await this.ticketsRepo.save(ticket);
        created++;
      } catch (e) {
        failed++;
        errors.push(`Row ${rowNum}: ${e.message}`);
      }
    }

    await this.auditService.log({
      action: AuditAction.IMPORT,
      entity_type: AuditEntityType.TICKET,
      actor_id: actorId,
      metadata: { project_id: projectId, created, failed },
    });

    return { created, failed, errors };
  }

  private validateRow(row: any, rowNum: number): void {
    if (!row.title?.trim()) {
      throw new Error('title is required');
    }
    if (!row.type || !VALID_TYPES.includes(row.type)) {
      throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (row.status && !VALID_STATUSES.includes(row.status)) {
      throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (row.priority && !VALID_PRIORITIES.includes(row.priority)) {
      throw new Error(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
    if (row.assignee_id && isNaN(Number(row.assignee_id))) {
      throw new Error('assignee_id must be a number');
    }
  }
}
