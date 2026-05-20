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
var EscalationScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscalationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("../tickets/ticket.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const PRIORITY_ORDER = [
    ticket_entity_1.TicketPriority.LOW,
    ticket_entity_1.TicketPriority.MEDIUM,
    ticket_entity_1.TicketPriority.HIGH,
    ticket_entity_1.TicketPriority.CRITICAL,
];
let EscalationScheduler = EscalationScheduler_1 = class EscalationScheduler {
    constructor(ticketsRepo, auditService) {
        this.ticketsRepo = ticketsRepo;
        this.auditService = auditService;
        this.logger = new common_1.Logger(EscalationScheduler_1.name);
    }
    async escalateOverdueTickets() {
        const now = new Date();
        const overdueTickets = await this.ticketsRepo.find({
            where: {
                due_date: (0, typeorm_2.LessThan)(now),
                status: (0, typeorm_2.Not)(ticket_entity_1.TicketStatus.DONE),
                deleted_at: null,
            },
        });
        if (!overdueTickets.length)
            return;
        this.logger.log(`Escalation check: ${overdueTickets.length} overdue ticket(s) found`);
        for (const ticket of overdueTickets) {
            const currentIdx = PRIORITY_ORDER.indexOf(ticket.priority);
            if (ticket.priority === ticket_entity_1.TicketPriority.CRITICAL) {
                if (!ticket.is_overdue) {
                    ticket.is_overdue = true;
                    await this.ticketsRepo.save(ticket);
                }
                continue;
            }
            if (ticket.escalation_reset) {
                ticket.escalation_reset = false;
                await this.ticketsRepo.save(ticket);
                continue;
            }
            const newPriority = PRIORITY_ORDER[currentIdx + 1];
            const oldPriority = ticket.priority;
            ticket.priority = newPriority;
            ticket.is_overdue = newPriority === ticket_entity_1.TicketPriority.CRITICAL;
            await this.ticketsRepo.save(ticket);
            await this.auditService.log({
                action: audit_log_entity_1.AuditAction.ESCALATE,
                entity_type: audit_log_entity_1.AuditEntityType.TICKET,
                entity_id: ticket.id,
                actor: 'SYSTEM',
                metadata: {
                    from_priority: oldPriority,
                    to_priority: newPriority,
                    due_date: ticket.due_date,
                },
            });
            this.logger.log(`Ticket #${ticket.id} escalated: ${oldPriority} → ${newPriority}`);
        }
    }
};
exports.EscalationScheduler = EscalationScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EscalationScheduler.prototype, "escalateOverdueTickets", null);
exports.EscalationScheduler = EscalationScheduler = EscalationScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService])
], EscalationScheduler);
//# sourceMappingURL=escalation.scheduler.js.map