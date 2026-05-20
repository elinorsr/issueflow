import { Repository } from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { AuditService } from '../audit/audit.service';
export declare class CsvService {
    private readonly ticketsRepo;
    private readonly auditService;
    constructor(ticketsRepo: Repository<Ticket>, auditService: AuditService);
    exportTickets(projectId: number, actorId?: number): Promise<string>;
    importTickets(projectId: number, fileBuffer: Buffer, actorId?: number): Promise<{
        created: number;
        failed: number;
        errors: string[];
    }>;
    private validateRow;
}
