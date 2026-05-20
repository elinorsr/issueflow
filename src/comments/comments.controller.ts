import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tickets/:ticketId/comments')
  create(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(ticketId, dto);
  }

  @Get('tickets/:ticketId/comments')
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.commentsService.findByTicket(ticketId);
  }

  @Patch('comments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, dto);
  }

  @Delete('comments/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }
}
