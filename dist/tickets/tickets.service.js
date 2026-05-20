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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("./ticket.entity");
const user_entity_1 = require("../users/user.entity");
const audit_service_1 = require("../audit/audit.service");
const audit_log_entity_1 = require("../audit/audit-log.entity");
const dependencies_service_1 = require("./dependencies.service");
let TicketsService = class TicketsService {
    constructor(ticketsRepo, usersRepo, auditService, depsService) {
        this.ticketsRepo = ticketsRepo;
        this.usersRepo = usersRepo;
        this.auditService = auditService;
        this.depsService = depsService;
    }
    async create(dto, actorId, actorName) {
        let assignee_id = dto.assignee_id ?? null;
        let autoAssigned = false;
        if (!assignee_id) {
            assignee_id = await this.autoAssign(dto.project_id);
            if (assignee_id)
                autoAssigned = true;
        }
        const ticket = this.ticketsRepo.create({ ...dto, assignee_id });
        const saved = await this.ticketsRepo.save(ticket);
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.CREATE,
            entity_type: audit_log_entity_1.AuditEntityType.TICKET,
            entity_id: saved.id,
            actor_id: actorId,
            actor: actorName ?? 'SYSTEM',
            metadata: { title: saved.title, project_id: saved.project_id },
        });
        if (autoAssigned) {
            await this.auditService.log({
                action: audit_log_entity_1.AuditAction.AUTO_ASSIGN,
                entity_type: audit_log_entity_1.AuditEntityType.TICKET,
                entity_id: saved.id,
                actor: 'SYSTEM',
                metadata: { assignee_id },
            });
        }
        return saved;
    }
    async findByProject(project_id) {
        return this.ticketsRepo.find({ where: { project_id } });
    }
    async findOne(id) {
        const ticket = await this.ticketsRepo.findOne({ where: { id } });
        if (!ticket)
            throw new common_1.NotFoundException(`Ticket ${id} not found`);
        return ticket;
    }
    async update(id, dto, actorId, actorName) {
        const ticket = await this.findOne(id);
        if (ticket.status === ticket_entity_1.TicketStatus.DONE) {
            throw new common_1.BadRequestException('Cannot update a ticket that is DONE');
        }
        if (dto.version !== undefined && dto.version !== ticket.version) {
            throw new common_1.ConflictException('Ticket was modified by another user. Please refresh and try again.');
        }
        if (dto.status && dto.status !== ticket.status) {
            this.validateStatusTransition(ticket.status, dto.status);
            if (dto.status === ticket_entity_1.TicketStatus.DONE) {
                const blocked = await this.depsService.hasUnresolvedBlockers(id);
                if (blocked) {
                    throw new common_1.BadRequestException('Cannot mark ticket as DONE: it has unresolved blockers');
                }
            }
        }
        if (dto.priority && dto.priority !== ticket.priority) {
            ticket.is_overdue = false;
            ticket.escalation_reset = true;
        }
        Object.assign(ticket, dto);
        const saved = await this.ticketsRepo.save(ticket);
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.UPDATE,
            entity_type: audit_log_entity_1.AuditEntityType.TICKET,
            entity_id: saved.id,
            actor_id: actorId,
            actor: actorName ?? 'SYSTEM',
            metadata: dto,
        });
        return saved;
    }
    async remove(id, actorId, actorName) {
        const ticket = await this.findOne(id);
        await this.ticketsRepo.softRemove(ticket);
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.DELETE,
            entity_type: audit_log_entity_1.AuditEntityType.TICKET,
            entity_id: id,
            actor_id: actorId,
            actor: actorName,
        });
    }
    async restore(id, actorId, actorName) {
        await this.ticketsRepo.restore(id);
        const ticket = await this.findOne(id);
        await this.auditService.log({
            action: audit_log_entity_1.AuditAction.RESTORE,
            entity_type: audit_log_entity_1.AuditEntityType.TICKET,
            entity_id: id,
            actor_id: actorId,
            actor: actorName,
        });
        return ticket;
    }
    async findDeleted(project_id) {
        return this.ticketsRepo
            .createQueryBuilder('t')
            .withDeleted()
            .where('t.project_id = :project_id', { project_id })
            .andWhere('t.deleted_at IS NOT NULL')
            .getMany();
    }
    async getWorkload(project_id) {
        const rows = await this.ticketsRepo
            .createQueryBuilder('t')
            .select('t.assignee_id', 'userId')
            .addSelect('u.username', 'username')
            .addSelect('COUNT(t.id)', 'openTicketCount')
            .innerJoin(user_entity_1.User, 'u', 'u.id = t.assignee_id')
            .where('t.project_id = :project_id', { project_id })
            .andWhere('t.status != :done', { done: ticket_entity_1.TicketStatus.DONE })
            .andWhere('t.deleted_at IS NULL')
            .groupBy('t.assignee_id')
            .addGroupBy('u.username')
            .orderBy('openTicketCount', 'ASC')
            .getRawMany();
        return rows.map(r => ({
            userId: Number(r.userId),
            username: r.username,
            openTicketCount: Number(r.openTicketCount),
        }));
    }
    validateStatusTransition(from, to) {
        const fromIdx = ticket_entity_1.STATUS_ORDER.indexOf(from);
        const toIdx = ticket_entity_1.STATUS_ORDER.indexOf(to);
        if (toIdx <= fromIdx) {
            throw new common_1.BadRequestException(`Invalid status transition: ${from} → ${to}. Status can only move forward.`);
        }
    }
    async autoAssign(project_id) {
        const developers = await this.usersRepo.find({
            where: { role: user_entity_1.UserRole.DEVELOPER },
            order: { created_at: 'ASC' },
        });
        if (!developers.length)
            return null;
        const workloadMap = new Map(developers.map(d => [d.id, 0]));
        const openCounts = await this.ticketsRepo
            .createQueryBuilder('t')
            .select('t.assignee_id', 'assignee_id')
            .addSelect('COUNT(t.id)', 'count')
            .where('t.project_id = :project_id', { project_id })
            .andWhere('t.status != :done', { done: ticket_entity_1.TicketStatus.DONE })
            .andWhere('t.deleted_at IS NULL')
            .andWhere('t.assignee_id IN (:...ids)', { ids: developers.map(d => d.id) })
            .groupBy('t.assignee_id')
            .getRawMany();
        for (const row of openCounts) {
            workloadMap.set(Number(row.assignee_id), Number(row.count));
        }
        let minLoad = Infinity;
        let chosen = null;
        for (const dev of developers) {
            const load = workloadMap.get(dev.id) ?? 0;
            if (load < minLoad) {
                minLoad = load;
                chosen = dev.id;
            }
        }
        return chosen;
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        dependencies_service_1.DependenciesService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map