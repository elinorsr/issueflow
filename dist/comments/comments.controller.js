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
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
const comment_dto_1 = require("./comment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CommentsController = class CommentsController {
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    create(ticketId, dto) {
        return this.commentsService.create(ticketId, dto);
    }
    findByTicket(ticketId) {
        return this.commentsService.findByTicket(ticketId);
    }
    update(id, dto) {
        return this.commentsService.update(id, dto);
    }
    remove(id) {
        return this.commentsService.remove(id);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)('tickets/:ticketId/comments'),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('tickets/:ticketId/comments'),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "findByTicket", null);
__decorate([
    (0, common_1.Patch)('comments/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, comment_dto_1.UpdateCommentDto]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "remove", null);
exports.CommentsController = CommentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map