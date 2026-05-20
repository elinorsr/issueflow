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
exports.Ticket = exports.STATUS_ORDER = exports.TicketType = exports.TicketPriority = exports.TicketStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_entity_1 = require("../projects/project.entity");
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["TODO"] = "TODO";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["IN_REVIEW"] = "IN_REVIEW";
    TicketStatus["DONE"] = "DONE";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "LOW";
    TicketPriority["MEDIUM"] = "MEDIUM";
    TicketPriority["HIGH"] = "HIGH";
    TicketPriority["CRITICAL"] = "CRITICAL";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
var TicketType;
(function (TicketType) {
    TicketType["BUG"] = "BUG";
    TicketType["FEATURE"] = "FEATURE";
    TicketType["TECHNICAL"] = "TECHNICAL";
})(TicketType || (exports.TicketType = TicketType = {}));
exports.STATUS_ORDER = [
    TicketStatus.TODO,
    TicketStatus.IN_PROGRESS,
    TicketStatus.IN_REVIEW,
    TicketStatus.DONE,
];
let Ticket = class Ticket {
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ticket.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TicketStatus, default: TicketStatus.TODO }),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM }),
    __metadata("design:type", String)
], Ticket.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TicketType }),
    __metadata("design:type", String)
], Ticket.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Ticket.prototype, "project_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Ticket.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Ticket.prototype, "assignee_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'assignee_id' }),
    __metadata("design:type", user_entity_1.User)
], Ticket.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], Ticket.prototype, "due_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Ticket.prototype, "is_overdue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Ticket.prototype, "escalation_reset", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], Ticket.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Ticket.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ticket.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Ticket.prototype, "updated_at", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)('tickets')
], Ticket);
//# sourceMappingURL=ticket.entity.js.map