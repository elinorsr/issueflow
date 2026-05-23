import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketDependency } from './ticket-dependency.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { DependenciesService } from './dependencies.service';
import { DependenciesController } from './dependencies.controller';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketDependency, User, Project]),
    AuditModule,
  ],
  providers: [TicketsService, DependenciesService, CsvService],
  controllers: [TicketsController, DependenciesController, CsvController],
  exports: [TicketsService, DependenciesService, CsvService],
})
export class TicketsModule {}
