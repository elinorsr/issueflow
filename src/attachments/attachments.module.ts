import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './attachment.entity';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment]), AuditModule],
  providers: [AttachmentsService],
  controllers: [AttachmentsController],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
