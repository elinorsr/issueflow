import { Repository } from 'typeorm';
import { TicketDependency } from './ticket-dependency.entity';
import { Ticket } from './ticket.entity';
export declare class DependenciesService {
    private readonly depsRepo;
    private readonly ticketsRepo;
    constructor(depsRepo: Repository<TicketDependency>, ticketsRepo: Repository<Ticket>);
    addDependency(ticketId: number, blockedById: number): Promise<TicketDependency>;
    listDependencies(ticketId: number): Promise<Ticket[]>;
    removeDependency(ticketId: number, blockerId: number): Promise<void>;
    hasUnresolvedBlockers(ticketId: number): Promise<boolean>;
}
