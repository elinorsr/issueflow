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
exports.DependenciesController = void 0;
const common_1 = require("@nestjs/common");
const dependencies_service_1 = require("./dependencies.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const class_validator_1 = require("class-validator");
class AddDependencyDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddDependencyDto.prototype, "blockedBy", void 0);
let DependenciesController = class DependenciesController {
    constructor(depsService) {
        this.depsService = depsService;
    }
    add(ticketId, dto) {
        return this.depsService.addDependency(ticketId, dto.blockedBy);
    }
    list(ticketId) {
        return this.depsService.listDependencies(ticketId);
    }
    remove(ticketId, blockerId) {
        return this.depsService.removeDependency(ticketId, blockerId);
    }
};
exports.DependenciesController = DependenciesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, AddDependencyDto]),
    __metadata("design:returntype", void 0)
], DependenciesController.prototype, "add", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DependenciesController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':blockerId'),
    __param(0, (0, common_1.Param)('ticketId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('blockerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], DependenciesController.prototype, "remove", null);
exports.DependenciesController = DependenciesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tickets/:ticketId/dependencies'),
    __metadata("design:paramtypes", [dependencies_service_1.DependenciesService])
], DependenciesController);
//# sourceMappingURL=dependencies.controller.js.map