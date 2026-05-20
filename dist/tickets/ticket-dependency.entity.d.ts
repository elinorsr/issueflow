import { Ticket } from '../tickets/ticket.entity';
export declare class TicketDependency {
    id: number;
    ticket_id: number;
    ticket: Ticket;
    blocked_by_id: number;
    blockedBy: Ticket;
    created_at: Date;
}
