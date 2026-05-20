import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
export declare class ProjectsService {
    private readonly projectsRepo;
    constructor(projectsRepo: Repository<Project>);
    create(dto: CreateProjectDto): Promise<Project>;
    findAll(): Promise<Project[]>;
    findOne(id: number): Promise<Project>;
    update(id: number, dto: UpdateProjectDto): Promise<Project>;
    remove(id: number): Promise<void>;
    restore(id: number): Promise<Project>;
    findDeleted(): Promise<Project[]>;
}
