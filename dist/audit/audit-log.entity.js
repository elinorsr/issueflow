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
exports.AuditLog = exports.AuditEntityType = exports.AuditAction = void 0;
const typeorm_1 = require("typeorm");
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["RESTORE"] = "RESTORE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["AUTO_ASSIGN"] = "AUTO_ASSIGN";
    AuditAction["ESCALATE"] = "ESCALATE";
    AuditAction["ADD_DEPENDENCY"] = "ADD_DEPENDENCY";
    AuditAction["REMOVE_DEPENDENCY"] = "REMOVE_DEPENDENCY";
    AuditAction["UPLOAD_ATTACHMENT"] = "UPLOAD_ATTACHMENT";
    AuditAction["DELETE_ATTACHMENT"] = "DELETE_ATTACHMENT";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["IMPORT"] = "IMPORT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditEntityType;
(function (AuditEntityType) {
    AuditEntityType["USER"] = "USER";
    AuditEntityType["PROJECT"] = "PROJECT";
    AuditEntityType["TICKET"] = "TICKET";
    AuditEntityType["COMMENT"] = "COMMENT";
    AuditEntityType["ATTACHMENT"] = "ATTACHMENT";
})(AuditEntityType || (exports.AuditEntityType = AuditEntityType = {}));
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuditAction }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuditEntityType }),
    __metadata("design:type", String)
], AuditLog.prototype, "entity_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "entity_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "actor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "created_at", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs')
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map