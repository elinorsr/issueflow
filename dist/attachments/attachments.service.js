"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = require("fs");
const attachment_entity_1 = require("./attachment.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'application/pdf',
    'text/plain',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
let AttachmentsService = class AttachmentsService {
    constructor(attachmentsRepo, auditService) {
        this.attachmentsRepo = attachmentsRepo;
        this.auditService = auditService;
    }
    async upload(ticketId, file, uploadedById) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            this.tryDeleteFile(file.path);
            throw new common_1.BadRequestException(`File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
        }
        if (file.size > MAX_FILE_SIZE) {
            this.tryDeleteFile(file.path);
            throw new common_1.BadRequestException(`File exceeds 10 MB limit (received ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
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
            action: audit_log_entity_1.AuditAction.UPLOAD_ATTACHMENT,
            entity_type: audit_log_entity_1.AuditEntityType.ATTACHMENT,
            entity_id: saved.id,
            actor_id: uploadedById,
            metadata: { ticket_id: ticketId, filename: file.originalname, size: file.size },
        });
        return saved;
    }
    async findByTicket(ticketId) {
        return this.attachmentsRepo.find({ where: { ticket_id: ticketId } });
    }
    async remove(id, actorId) {
        const attachment = await this.attachmentsRepo.findOne({ where: { id } });
        if (!attachment)
            throw new common_1.NotFoundException(`Attachment ${id} not found`);
        this.tryDeleteFile(attachment.storage_path);
        await this.attachmentsRepo.remove(attachment);
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.DELETE_ATTACHMENT,
            entity_type: audit_log_entity_1.AuditEntityType.ATTACHMENT,
            entity_id: id,
            actor_id: actorId,
            metadata: { filename: attachment.original_name },
        });
    }
    getFilePath(id) {
        return this.attachmentsRepo.findOne({ where: { id } }).then(a => {
            if (!a)
                throw new common_1.NotFoundException(`Attachment ${id} not found`);
            return a;
        });
    }
    tryDeleteFile(filePath) {
        try {
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
        }
        catch {
        }
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map