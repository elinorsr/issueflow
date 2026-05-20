import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, DeleteDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  owner_id: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
