import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  ticket_id: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column()
  author_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'comment_mentions',
    joinColumn: { name: 'comment_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  mentionedUsers: User[];

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
