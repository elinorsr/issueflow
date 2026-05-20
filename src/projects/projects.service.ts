import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectsRepo: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepo.create(dto);
    return this.projectsRepo.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepo.find();
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);
    await this.projectsRepo.softRemove(project);
  }

  async restore(id: number): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    await this.projectsRepo.restore(id);
    return this.projectsRepo.findOne({ where: { id } });
  }

  async findDeleted(): Promise<Project[]> {
    return this.projectsRepo.find({ withDeleted: true, where: {} });
  }
}
