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
exports.CsvService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sync_1 = require("csv-stringify/sync");
const sync_2 = require("csv-parse/sync");
const ticket_entity_1 = require("../tickets/ticket.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const CSV_FIELDS = ['id', 'title', 'description', 'status', 'priority', 'type', 'assignee_id'];
const VALID_STATUSES = Object.values(ticket_entity_1.TicketStatus);
const VALID_PRIORITIES = Object.values(ticket_entity_1.TicketPriority);
const VALID_TYPES = Object.values(ticket_entity_1.TicketType);
let CsvService = class CsvService {
    constructor(ticketsRepo, auditService) {
        this.ticketsRepo = ticketsRepo;
        this.auditService = auditService;
    }
    async exportTickets(projectId, actorId) {
        const tickets = await this.ticketsRepo.find({ where: { project_id: projectId } });
        const rows = tickets.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description ?? '',
            status: t.status,
            priority: t.priority,
            type: t.type,
            assignee_id: t.assignee_id ?? '',
        }));
        const csv = (0, sync_1.stringify)(rows, {
            header: true,
            columns: CSV_FIELDS,
            quoted: true,
        });
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.EXPORT,
            entity_type: audit_log_entity_1.AuditEntityType.TICKET,
            actor_id: actorId,
            metadata: { project_id: projectId, count: tickets.length },
        });
        return csv;
    }
    async importTickets(projectId, fileBuffer, actorId) {
        let records;
        try {
            records = (0, sync_2.parse)(fileBuffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_quotes: true,
            });
        }
        catch (e) {
            throw new common_1.BadRequestException(`Invalid CSV format: ${e.message}`);
        }
        let created = 0;
        let failed = 0;
        const errors = [];
        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNum = i + 2;
            try {
                this.validateRow(row, rowNum);
                const ticket = this.ticketsRepo.create({
                    title: row.title,
                    description: row.description || null,
                    status: row.status || ticket_entity_1.TicketStatus.TODO,
                    priority: row.priority || ticket_entity_1.TicketPriority.MEDIUM,
                    type: row.type,
                    project_id: projectId,
                    assignee_id: row.assignee_id ? Number(row.assignee_id) : null,
                });
                await this.ticketsRepo.save(ticket);
                created++;
            }
            catch (e) {
                failed++;
                errors.push(`Row ${rowNum}: ${e.message}`);
            }
        }
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.IMPORT,
            entity_type: audit_log_entity_1.AuditEntityType.TICKET,
            actor_id: actorId,
            metadata: { project_id: projectId, created, failed },
        });
        return { created, failed, errors };
    }
    validateRow(row, rowNum) {
        if (!row.title?.trim()) {
            throw new Error('title is required');
        }
        if (!row.type || !VALID_TYPES.includes(row.type)) {
            throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
        }
        if (row.status && !VALID_STATUSES.includes(row.status)) {
            throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
        if (row.priority && !VALID_PRIORITIES.includes(row.priority)) {
            throw new Error(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
        }
        if (row.assignee_id && isNaN(Number(row.assignee_id))) {
            throw new Error('assignee_id must be a number');
        }
    }
};
exports.CsvService = CsvService;
exports.CsvService = CsvService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], CsvService);
//# sourceMappingURL=csv.service.js.map