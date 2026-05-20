import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findByProject(projectId: number): Promise<import("./ticket.entity").Ticket[]>;
    getWorkload(projectId: number): Promise<{
        userId: number;
        username: string;
        openTicketCount: number;
    }[]>;
    create(dto: CreateTicketDto, user: any): Promise<import("./ticket.entity").Ticket>;
    findDeleted(projectId: number): Promise<import("./ticket.entity").Ticket[]>;
    findOne(id: number): Promise<import("./ticket.entity").Ticket>;
    update(id: number, dto: UpdateTicketDto, user: any): Promise<import("./ticket.entity").Ticket>;
    remove(id: number, user: any): Promise<void>;
    restore(id: number, user: any): Promise<import("./ticket.entity").Ticket>;
}
