import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';
import { User } from '../users/user.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket_id: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column()
  uploaded_by_id: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @Column()
  original_name: string;

  @Column()
  mime_type: string;

  @Column()
  size: number;

  @Column()
  storage_path: string;

  @CreateDateColumn()
  created_at: Date;
}
