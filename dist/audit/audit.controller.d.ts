import { AuditService } from './audit.service';
import { AuditAction, AuditEntityType } from './audit-log.entity';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(action?: AuditAction, entity_type?: AuditEntityType, entity_id?: string, actor_id?: string): Promise<import("./audit-log.entity").AuditLog[]>;
}
