import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';
export declare class Attachment {
    id: number;
    ticket_id: number;
    ticket: Ticket;
    uploaded_by_id: number;
    uploadedBy: User;
    original_name: string;
    mime_type: string;
    size: number;
    storage_path: string;
    created_at: Date;
}
