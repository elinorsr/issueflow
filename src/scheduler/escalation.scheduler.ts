import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not } from 'typeorm';
import { Ticket, TicketPriority, TicketStatus } from '../tickets/ticket.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';

const PRIORITY_ORDER = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.CRITICAL,
];

@Injectable()
export class EscalationScheduler {
  private readonly logger = new Logger(EscalationScheduler.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,
    private readonly auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async escalateOverdueTickets(): Promise<void> {
    const now = new Date();

    // Find overdue tickets that are not DONE and have a due_date set
    const overdueTickets = await this.ticketsRepo.find({
      where: {
        due_date: LessThan(now),
        status: Not(TicketStatus.DONE),
        deleted_at: null,
      },
    });

    if (!overdueTickets.length) return;

    this.logger.log(`Escalation check: ${overdueTickets.length} overdue ticket(s) found`);

    for (const ticket of overdueTickets) {
      const currentIdx = PRIORITY_ORDER.indexOf(ticket.priority);

      if (ticket.priority === TicketPriority.CRITICAL) {
        // Already at max — just ensure is_overdue flag is set
        if (!ticket.is_overdue) {
          ticket.is_overdue = true;
          await this.ticketsRepo.save(ticket);
        }
        continue;
      }

      // Skip if user manually reset escalation at current priority
      if (ticket.escalation_reset) {
        ticket.escalation_reset = false;
        await this.ticketsRepo.save(ticket);
        continue;
      }

      const newPriority = PRIORITY_ORDER[currentIdx + 1];
      const oldPriority = ticket.priority;

      ticket.priority = newPriority;
      ticket.is_overdue = newPriority === TicketPriority.CRITICAL;

      await this.ticketsRepo.save(ticket);

      await this.auditService.log({
        action: AuditAction.ESCALATE,
        entity_type: AuditEntityType.TICKET,
        entity_id: ticket.id,
        actor: 'SYSTEM',
        metadata: {
          from_priority: oldPriority,
          to_priority: newPriority,
          due_date: ticket.due_date,
        },
      });

      this.logger.log(
        `Ticket #${ticket.id} escalated: ${oldPriority} → ${newPriority}`,
      );
    }
  }
}
