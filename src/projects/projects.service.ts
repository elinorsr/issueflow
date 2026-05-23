import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectsRepo: Repository<Project>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateProjectDto,
    actorId?: number,
    actorName?: string,
  ): Promise<Project> {
    const owner = await this.usersRepo.findOne({ where: { id: dto.owner_id } });
    if (!owner) throw new BadRequestException(`User ${dto.owner_id} not found`);

    const project = this.projectsRepo.create(dto);
    const saved = await this.projectsRepo.save(project);

    await this.auditService.log({
      action: AuditAction.CREATE,
      entity_type: AuditEntityType.PROJECT,
      entity_id: saved.id,
      actor_id: actorId,
      actor: actorName,
      metadata: { name: saved.name, owner_id: saved.owner_id },
    });

    return saved;
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepo.find();
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(
    id: number,
    dto: UpdateProjectDto,
    actorId?: number,
    actorName?: string,
  ): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, dto);
    const saved = await this.projectsRepo.save(project);

    await this.auditService.log({
      action: AuditAction.UPDATE,
      entity_type: AuditEntityType.PROJECT,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
      metadata: { updated_fields: Object.keys(dto) },
    });

    return saved;
  }

  async remove(
    id: number,
    actorId?: number,
    actorName?: string,
  ): Promise<void> {
    const project = await this.findOne(id);
    await this.projectsRepo.softRemove(project);

    await this.auditService.log({
      action: AuditAction.DELETE,
      entity_type: AuditEntityType.PROJECT,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
      metadata: { name: project.name },
    });
  }

  async restore(
    id: number,
    actorId?: number,
    actorName?: string,
  ): Promise<Project> {
    const project = await this.projectsRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    await this.projectsRepo.restore(id);

    await this.auditService.log({
      action: AuditAction.RESTORE,
      entity_type: AuditEntityType.PROJECT,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
      metadata: { name: project.name },
    });

    return this.projectsRepo.findOne({ where: { id } });
  }

  async findDeleted(): Promise<Project[]> {
    return this.projectsRepo
      .createQueryBuilder('p')
      .withDeleted()
      .where('p.deleted_at IS NOT NULL')
      .orderBy('p.deleted_at', 'DESC')
      .getMany();
  }
}
