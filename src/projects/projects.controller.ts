import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(dto, user?.id, user?.username);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Get('deleted')
  findDeleted() {
    return this.projectsService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.update(id, dto, user?.id, user?.username);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.projectsService.remove(id, user?.id, user?.username);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.projectsService.restore(id, user?.id, user?.username);
  }
}
