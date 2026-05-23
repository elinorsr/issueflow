import {
  Controller, Get, Post, Query, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile, Res, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CsvService } from './csv.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get('export')
  async export(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Res() res: Response,
    @CurrentUser() user: any,
  ) {
    const csv = await this.csvService.exportTickets(projectId, user?.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tickets-project-${projectId}.csv"`);
    res.send(csv);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(
    @Query('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('CSV file is required');
    return this.csvService.importTickets(projectId, file.buffer, user?.id);
  }
}
