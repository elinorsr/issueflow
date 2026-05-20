import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { EscalationScheduler } from './escalation.scheduler';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Ticket]),
    AuditModule,
  ],
  providers: [EscalationScheduler],
})
export class SchedulerModule {}
