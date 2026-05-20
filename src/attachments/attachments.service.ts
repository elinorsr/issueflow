import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Attachment } from './attachment.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/plain',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentsRepo: Repository<Attachment>,
    private readonly auditService: AuditService,
  ) {}

  async upload(
    ticketId: number,
    file: Express.Multer.File,
    uploadedById: number,
  ): Promise<Attachment> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Clean up temp file
      this.tryDeleteFile(file.path);
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      this.tryDeleteFile(file.path);
      throw new BadRequestException(
        `File exceeds 10 MB limit (received ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      );
    }

    const attachment = this.attachmentsRepo.create({
      ticket_id: ticketId,
      uploaded_by_id: uploadedById,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      storage_path: file.path,
    });

    const saved = await this.attachmentsRepo.save(attachment);

    await this.auditService.log({
      action: AuditAction.UPLOAD_ATTACHMENT,
      entity_type: AuditEntityType.ATTACHMENT,
      entity_id: saved.id,
      actor_id: uploadedById,
      metadata: { ticket_id: ticketId, filename: file.originalname, size: file.size },
    });

    return saved;
  }

  async findByTicket(ticketId: number): Promise<Attachment[]> {
    return this.attachmentsRepo.find({ where: { ticket_id: ticketId } });
  }

  async remove(id: number, actorId?: number): Promise<void> {
    const attachment = await this.attachmentsRepo.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException(`Attachment ${id} not found`);

    this.tryDeleteFile(attachment.storage_path);
    await this.attachmentsRepo.remove(attachment);

    await this.auditService.log({
      action: AuditAction.DELETE_ATTACHMENT,
      entity_type: AuditEntityType.ATTACHMENT,
      entity_id: id,
      actor_id: actorId,
      metadata: { filename: attachment.original_name },
    });
  }

  getFilePath(id: number): Promise<Attachment> {
    return this.attachmentsRepo.findOne({ where: { id } }).then(a => {
      if (!a) throw new NotFoundException(`Attachment ${id} not found`);
      return a;
    });
  }

  private tryDeleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // ignore — file might already be gone
    }
  }
}
