import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import { AuditService } from '../audit/audit.service';
export declare class AttachmentsService {
    private readonly attachmentsRepo;
    private readonly auditService;
    constructor(attachmentsRepo: Repository<Attachment>, auditService: AuditService);
    upload(ticketId: number, file: Express.Multer.File, uploadedById: number): Promise<Attachment>;
    findByTicket(ticketId: number): Promise<Attachment[]>;
    remove(id: number, actorId?: number): Promise<void>;
    getFilePath(id: number): Promise<Attachment>;
    private tryDeleteFile;
}
