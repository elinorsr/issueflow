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
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
const attachments_service_1 = require("./attachments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const storage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}-${file.originalname}`);
    },
});
let AttachmentsController = class AttachmentsController {
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    upload(ticketId, file, user) {
        return this.attachmentsService.upload(ticketId, file, user?.id);
    }
    findByTicket(ticketId) {
        return this.attachmentsService.findByTicket(ticketId);
    }
    async download(id, res) {
        const attachment = await this.attachmentsService.getFilePath(id);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
        res.setHeader('Content-Type', attachment.mime_type);
        res.sendFile(path.resolve(attachment.storage_path));
    }
    remove(id, user) {
        return this.attachmentsService.remove(id, user?.id);
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage })),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findByTicket", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "download", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "remove", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tickets/:ticketId/attachments'),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map