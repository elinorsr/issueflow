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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const tickets_service_1 = require("./tickets.service");
const ticket_dto_1 = require("./ticket.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let TicketsController = class TicketsController {
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    findByProject(projectId) {
        return this.ticketsService.findByProject(projectId);
    }
    getWorkload(projectId) {
        return this.ticketsService.getWorkload(projectId);
    }
    create(dto, user) {
        return this.ticketsService.create(dto, user?.id, user?.username);
    }
    findDeleted(projectId) {
        return this.ticketsService.findDeleted(projectId);
    }
    findOne(id) {
        return this.ticketsService.findOne(id);
    }
    update(id, dto, user) {
        return this.ticketsService.update(id, dto, user?.id, user?.username);
    }
    remove(id, user) {
        return this.ticketsService.remove(id, user?.id, user?.username);
    }
    restore(id, user) {
        return this.ticketsService.restore(id, user?.id, user?.username);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)('projects/:projectId/tickets'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/workload'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "getWorkload", null);
__decorate([
    (0, common_1.Post)('tickets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ticket_dto_1.CreateTicketDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('tickets/deleted'),
    __param(0, (0, common_1.Query)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findDeleted", null);
__decorate([
    (0, common_1.Get)('tickets/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('tickets/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ticket_dto_1.UpdateTicketDto, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('tickets/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('tickets/:id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "restore", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map