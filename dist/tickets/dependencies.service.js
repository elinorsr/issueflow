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
exports.DependenciesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_dependency_entity_1 = require("./ticket-dependency.entity");
const ticket_entity_1 = require("./ticket.entity");
let DependenciesService = class DependenciesService {
    constructor(depsRepo, ticketsRepo) {
        this.depsRepo = depsRepo;
        this.ticketsRepo = ticketsRepo;
    }
    async addDependency(ticketId, blockedById) {
        const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId } });
        if (!ticket)
            throw new common_1.NotFoundException(`Ticket ${ticketId} not found`);
        const blocker = await this.ticketsRepo.findOne({ where: { id: blockedById } });
        if (!blocker)
            throw new common_1.NotFoundException(`Ticket ${blockedById} not found`);
        if (ticket.project_id !== blocker.project_id) {
            throw new common_1.BadRequestException('Both tickets must belong to the same project');
        }
        if (ticketId === blockedById) {
            throw new common_1.BadRequestException('A ticket cannot depend on itself');
        }
        const existing = await this.depsRepo.findOne({
            where: { ticket_id: ticketId, blocked_by_id: blockedById },
        });
        if (existing)
            throw new common_1.BadRequestException('Dependency already exists');
        const dep = this.depsRepo.create({ ticket_id: ticketId, blocked_by_id: blockedById });
        return this.depsRepo.save(dep);
    }
    async listDependencies(ticketId) {
        const deps = await this.depsRepo.find({
            where: { ticket_id: ticketId },
            relations: ['blockedBy'],
        });
        return deps.map(d => d.blockedBy);
    }
    async removeDependency(ticketId, blockerId) {
        const dep = await this.depsRepo.findOne({
            where: { ticket_id: ticketId, blocked_by_id: blockerId },
        });
        if (!dep)
            throw new common_1.NotFoundException('Dependency not found');
        await this.depsRepo.remove(dep);
    }
    async hasUnresolvedBlockers(ticketId) {
        const deps = await this.depsRepo.find({
            where: { ticket_id: ticketId },
            relations: ['blockedBy'],
        });
        return deps.some(d => d.blockedBy.status !== ticket_entity_1.TicketStatus.DONE);
    }
};
exports.DependenciesService = DependenciesService;
exports.DependenciesService = DependenciesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_dependency_entity_1.TicketDependency)),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DependenciesService);
//# sourceMappingURL=dependencies.service.js.map