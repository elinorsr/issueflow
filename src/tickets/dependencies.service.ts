import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketDependency } from './ticket-dependency.entity';
import { Ticket, TicketStatus } from './ticket.entity';

@Injectable()
export class DependenciesService {
  constructor(
    @InjectRepository(TicketDependency)
    private readonly depsRepo: Repository<TicketDependency>,
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,
  ) {}

  async addDependency(ticketId: number, blockedById: number): Promise<TicketDependency> {
    const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

    const blocker = await this.ticketsRepo.findOne({ where: { id: blockedById } });
    if (!blocker) throw new NotFoundException(`Ticket ${blockedById} not found`);

    if (ticket.project_id !== blocker.project_id) {
      throw new BadRequestException('Both tickets must belong to the same project');
    }

    if (ticketId === blockedById) {
      throw new BadRequestException('A ticket cannot depend on itself');
    }

    const existing = await this.depsRepo.findOne({
      where: { ticket_id: ticketId, blocked_by_id: blockedById },
    });
    if (existing) throw new BadRequestException('Dependency already exists');

    const dep = this.depsRepo.create({ ticket_id: ticketId, blocked_by_id: blockedById });
    return this.depsRepo.save(dep);
  }

  async listDependencies(ticketId: number): Promise<Ticket[]> {
    const deps = await this.depsRepo.find({
      where: { ticket_id: ticketId },
      relations: ['blockedBy'],
    });
    return deps.map(d => d.blockedBy);
  }

  async removeDependency(ticketId: number, blockerId: number): Promise<void> {
    const dep = await this.depsRepo.findOne({
      where: { ticket_id: ticketId, blocked_by_id: blockerId },
    });
    if (!dep) throw new NotFoundException('Dependency not found');
    await this.depsRepo.remove(dep);
  }

  async hasUnresolvedBlockers(ticketId: number): Promise<boolean> {
    const deps = await this.depsRepo.find({
      where: { ticket_id: ticketId },
      relations: ['blockedBy'],
    });
    return deps.some(d => d.blockedBy.status !== TicketStatus.DONE);
  }
}
