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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./project.entity");
let ProjectsService = class ProjectsService {
    constructor(projectsRepo) {
        this.projectsRepo = projectsRepo;
    }
    async create(dto) {
        const project = this.projectsRepo.create(dto);
        return this.projectsRepo.save(project);
    }
    async findAll() {
        return this.projectsRepo.find();
    }
    async findOne(id) {
        const project = await this.projectsRepo.findOne({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException(`Project ${id} not found`);
        return project;
    }
    async update(id, dto) {
        const project = await this.findOne(id);
        Object.assign(project, dto);
        return this.projectsRepo.save(project);
    }
    async remove(id) {
        const project = await this.findOne(id);
        await this.projectsRepo.softRemove(project);
    }
    async restore(id) {
        const project = await this.projectsRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!project)
            throw new common_1.NotFoundException(`Project ${id} not found`);
        await this.projectsRepo.restore(id);
        return this.projectsRepo.findOne({ where: { id } });
    }
    async findDeleted() {
        return this.projectsRepo.find({ withDeleted: true, where: {} });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map