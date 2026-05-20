import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { User } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import { DependenciesService } from './dependencies.service';
export declare class TicketsService {
    private readonly ticketsRepo;
    private readonly usersRepo;
    private readonly auditService;
    private readonly depsService;
    constructor(ticketsRepo: Repository<Ticket>, usersRepo: Repository<User>, auditService: AuditService, depsService: DependenciesService);
    create(dto: CreateTicketDto, actorId?: number, actorName?: string): Promise<Ticket>;
    findByProject(project_id: number): Promise<Ticket[]>;
    findOne(id: number): Promise<Ticket>;
    update(id: number, dto: UpdateTicketDto, actorId?: number, actorName?: string): Promise<Ticket>;
    remove(id: number, actorId?: number, actorName?: string): Promise<void>;
    restore(id: number, actorId?: number, actorName?: string): Promise<Ticket>;
    findDeleted(project_id: number): Promise<Ticket[]>;
    getWorkload(project_id: number): Promise<{
        userId: number;
        username: string;
        openTicketCount: number;
    }[]>;
    private validateStatusTransition;
    autoAssign(project_id: number): Promise<number | null>;
}
