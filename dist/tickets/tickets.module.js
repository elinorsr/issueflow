"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ticket_entity_1 = require("./ticket.entity");
const ticket_dependency_entity_1 = require("./ticket-dependency.entity");
const tickets_service_1 = require("./tickets.service");
const tickets_controller_1 = require("./tickets.controller");
const dependencies_service_1 = require("./dependencies.service");
const dependencies_controller_1 = require("./dependencies.controller");
const csv_service_1 = require("./csv.service");
const csv_controller_1 = require("./csv.controller");
const user_entity_1 = require("../users/user.entity");
const audit_module_1 = require("../audit/audit.module");
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([ticket_entity_1.Ticket, ticket_dependency_entity_1.TicketDependency, user_entity_1.User]),
            audit_module_1.AuditModule,
        ],
        providers: [tickets_service_1.TicketsService, dependencies_service_1.DependenciesService, csv_service_1.CsvService],
        controllers: [tickets_controller_1.TicketsController, dependencies_controller_1.DependenciesController, csv_controller_1.CsvController],
        exports: [tickets_service_1.TicketsService, dependencies_service_1.DependenciesService, csv_service_1.CsvService],
    })
], TicketsModule);
//# sourceMappingURL=tickets.module.js.map