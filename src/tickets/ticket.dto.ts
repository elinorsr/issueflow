import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional,
  IsString, IsDateString,
} from 'class-validator';
import { TicketPriority, TicketStatus, TicketType } from './ticket.entity';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsNotEmpty()
  @IsEnum(TicketType)
  type: TicketType;

  @IsNotEmpty()
  @IsNumber()
  project_id: number;

  @IsOptional()
  @IsNumber()
  assignee_id?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsNumber()
  assignee_id?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsNumber()
  version?: number;
}
