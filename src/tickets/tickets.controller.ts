import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('projects/:projectId/tickets')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.ticketsService.findByProject(projectId);
  }

  @Get('projects/:projectId/workload')
  getWorkload(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.ticketsService.getWorkload(projectId);
  }

  @Post('tickets')
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.create(dto, user?.id, user?.username);
  }

  @Roles(UserRole.ADMIN)
  @Get('tickets/deleted')
  findDeleted(@Query('projectId', ParseIntPipe) projectId: number) {
    return this.ticketsService.findDeleted(projectId);
  }

  @Get('tickets/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Patch('tickets/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.update(id, dto, user?.id, user?.username);
  }

  @Delete('tickets/:id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ticketsService.remove(id, user?.id, user?.username);
  }

  @Roles(UserRole.ADMIN)
  @Post('tickets/:id/restore')
  restore(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.ticketsService.restore(id, user?.id, user?.username);
  }
}
