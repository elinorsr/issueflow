import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    upload(ticketId: number, file: Express.Multer.File, user: any): Promise<import("./attachment.entity").Attachment>;
    findByTicket(ticketId: number): Promise<import("./attachment.entity").Attachment[]>;
    download(id: number, res: Response): Promise<void>;
    remove(id: number, user: any): Promise<void>;
}
