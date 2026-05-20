import { Repository } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { AuditService } from '../audit/audit.service';
export declare class EscalationScheduler {
    private readonly ticketsRepo;
    private readonly auditService;
    private readonly logger;
    constructor(ticketsRepo: Repository<Ticket>, auditService: AuditService);
    escalateOverdueTickets(): Promise<void>;
}
