export declare enum AuditAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    RESTORE = "RESTORE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    AUTO_ASSIGN = "AUTO_ASSIGN",
    ESCALATE = "ESCALATE",
    ADD_DEPENDENCY = "ADD_DEPENDENCY",
    REMOVE_DEPENDENCY = "REMOVE_DEPENDENCY",
    UPLOAD_ATTACHMENT = "UPLOAD_ATTACHMENT",
    DELETE_ATTACHMENT = "DELETE_ATTACHMENT",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT"
}
export declare enum AuditEntityType {
    USER = "USER",
    PROJECT = "PROJECT",
    TICKET = "TICKET",
    COMMENT = "COMMENT",
    ATTACHMENT = "ATTACHMENT"
}
export declare class AuditLog {
    id: number;
    action: AuditAction;
    entity_type: AuditEntityType;
    entity_id: number;
    actor_id: number;
    actor: string;
    metadata: Record<string, any>;
    created_at: Date;
}
