import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
export declare enum TicketStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
}
export declare enum TicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum TicketType {
    BUG = "BUG",
    FEATURE = "FEATURE",
    TECHNICAL = "TECHNICAL"
}
export declare const STATUS_ORDER: TicketStatus[];
export declare class Ticket {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    project_id: number;
    project: Project;
    assignee_id: number;
    assignee: User;
    due_date: Date;
    is_overdue: boolean;
    escalation_reset: boolean;
    version: number;
    deleted_at: Date;
    created_at: Date;
    updated_at: Date;
}
