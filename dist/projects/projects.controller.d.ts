import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto): Promise<import("./project.entity").Project>;
    findAll(): Promise<import("./project.entity").Project[]>;
    findDeleted(): Promise<import("./project.entity").Project[]>;
    findOne(id: number): Promise<import("./project.entity").Project>;
    update(id: number, dto: UpdateProjectDto): Promise<import("./project.entity").Project>;
    remove(id: number): Promise<void>;
    restore(id: number): Promise<import("./project.entity").Project>;
}
