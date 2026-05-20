import {
  Controller, Post, Get, Delete,
  Param, Body, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { DependenciesService } from './dependencies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber } from 'class-validator';

class AddDependencyDto {
  @IsNumber()
  blockedBy: number;
}

@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/dependencies')
export class DependenciesController {
  constructor(private readonly depsService: DependenciesService) {}

  @Post()
  add(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: AddDependencyDto,
  ) {
    return this.depsService.addDependency(ticketId, dto.blockedBy);
  }

  @Get()
  list(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.depsService.listDependencies(ticketId);
  }

  @Delete(':blockerId')
  remove(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Param('blockerId', ParseIntPipe) blockerId: number,
  ) {
    return this.depsService.removeDependency(ticketId, blockerId);
  }
}
