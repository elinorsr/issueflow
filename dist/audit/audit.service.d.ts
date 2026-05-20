import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from './audit-log.entity';
export interface LogPayload {
    action: AuditAction;
    entity_type: AuditEntityType;
    entity_id?: number;
    actor_id?: number;
    actor?: string;
    metadata?: Record<string, any>;
}
export declare class AuditService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    log(payload: LogPayload): Promise<void>;
    findAll(filters?: {
        action?: AuditAction;
        entity_type?: AuditEntityType;
        entity_id?: number;
        actor_id?: number;
    }): Promise<AuditLog[]>;
}
