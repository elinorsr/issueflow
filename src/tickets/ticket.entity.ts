import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  TECHNICAL = 'TECHNICAL',
}

export const STATUS_ORDER = [
  TicketStatus.TODO,
  TicketStatus.IN_PROGRESS,
  TicketStatus.IN_REVIEW,
  TicketStatus.DONE,
];

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.TODO })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketType })
  type: TicketType;

  @Column()
  project_id: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ nullable: true })
  assignee_id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ nullable: true, type: 'timestamptz' })
  due_date: Date;

  @Column({ default: false })
  is_overdue: boolean;

  @Column({ default: false })
  escalation_reset: boolean;

  @VersionColumn()
  version: number;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
