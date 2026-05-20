import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, Unique,
} from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';

@Entity('ticket_dependencies')
@Unique(['ticket_id', 'blocked_by_id'])
export class TicketDependency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket_id: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column()
  blocked_by_id: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blocked_by_id' })
  blockedBy: Ticket;

  @CreateDateColumn()
  created_at: Date;
}
