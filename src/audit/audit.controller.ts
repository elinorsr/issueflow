import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditAction, AuditEntityType } from './audit-log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(
    @Query('action') action?: AuditAction,
    @Query('entity_type') entity_type?: AuditEntityType,
    @Query('entity_id') entity_id?: string,
    @Query('actor_id') actor_id?: string,
  ) {
    return this.auditService.findAll({
      action,
      entity_type,
      entity_id: entity_id ? Number(entity_id) : undefined,
      actor_id: actor_id ? Number(actor_id) : undefined,
    });
  }
}
