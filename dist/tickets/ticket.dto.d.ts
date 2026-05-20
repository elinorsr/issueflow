import { TicketPriority, TicketStatus, TicketType } from './ticket.entity';
export declare class CreateTicketDto {
    title: string;
    description?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    type: TicketType;
    project_id: number;
    assignee_id?: number;
    due_date?: string;
}
export declare class UpdateTicketDto {
    title?: string;
    description?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignee_id?: number;
    due_date?: string;
    version?: number;
}
