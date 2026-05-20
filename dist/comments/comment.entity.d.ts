import { User } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';
export declare class Comment {
    id: number;
    content: string;
    ticket_id: number;
    ticket: Ticket;
    author_id: number;
    author: User;
    mentionedUsers: User[];
    version: number;
    created_at: Date;
    updated_at: Date;
}
