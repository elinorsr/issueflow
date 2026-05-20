import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(payload: LogPayload): Promise<void> {
    const entry = this.auditRepo.create(payload);
    await this.auditRepo.save(entry);
  }

  async findAll(filters?: {
    action?: AuditAction;
    entity_type?: AuditEntityType;
    entity_id?: number;
    actor?: string;
  }): Promise<AuditLog[]> {
    const qb = this.auditRepo
      .createQueryBuilder('al')
      .orderBy('al.created_at', 'DESC');

    if (filters?.action) qb.andWhere('al.action = :action', { action: filters.action });
    if (filters?.entity_type) qb.andWhere('al.entity_type = :entity_type', { entity_type: filters.entity_type });
    if (filters?.entity_id) qb.andWhere('al.entity_id = :entity_id', { entity_id: filters.entity_id });
    if (filters?.actor) qb.andWhere('al.actor = :actor', { actor: filters.actor });

    return qb.getMany();
  }
}
