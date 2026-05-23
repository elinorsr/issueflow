import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Ticket]), AuditModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
