import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommentsModule } from './comments/comments.module';
import { AuditModule } from './audit/audit.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuditModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    TicketsModule,
    CommentsModule,
    AttachmentsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
