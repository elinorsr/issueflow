import {
  Controller, Post, Get, Delete, Param, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  upload(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.attachmentsService.upload(ticketId, file, user?.id);
  }

  @Get()
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.attachmentsService.findByTicket(ticketId);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.getFilePath(id);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    res.sendFile(path.resolve(attachment.storage_path));
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.attachmentsService.remove(id, user?.id);
  }
}
