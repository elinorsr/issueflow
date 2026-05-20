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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketDependency = void 0;
const typeorm_1 = require("typeorm");
const ticket_entity_1 = require("../tickets/ticket.entity");
let TicketDependency = class TicketDependency {
};
exports.TicketDependency = TicketDependency;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TicketDependency.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TicketDependency.prototype, "ticket_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_entity_1.Ticket, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ticket_id' }),
    __metadata("design:type", ticket_entity_1.Ticket)
], TicketDependency.prototype, "ticket", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TicketDependency.prototype, "blocked_by_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_entity_1.Ticket, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'blocked_by_id' }),
    __metadata("design:type", ticket_entity_1.Ticket)
], TicketDependency.prototype, "blockedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TicketDependency.prototype, "created_at", void 0);
exports.TicketDependency = TicketDependency = __decorate([
    (0, typeorm_1.Entity)('ticket_dependencies'),
    (0, typeorm_1.Unique)(['ticket_id', 'blocked_by_id'])
], TicketDependency);
//# sourceMappingURL=ticket-dependency.entity.js.map