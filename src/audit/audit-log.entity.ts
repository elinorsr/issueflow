import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  AUTO_ASSIGN = 'AUTO_ASSIGN',
  ESCALATE = 'ESCALATE',
  ADD_DEPENDENCY = 'ADD_DEPENDENCY',
  REMOVE_DEPENDENCY = 'REMOVE_DEPENDENCY',
  UPLOAD_ATTACHMENT = 'UPLOAD_ATTACHMENT',
  DELETE_ATTACHMENT = 'DELETE_ATTACHMENT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export enum AuditEntityType {
  USER = 'USER',
  PROJECT = 'PROJECT',
  TICKET = 'TICKET',
  COMMENT = 'COMMENT',
  ATTACHMENT = 'ATTACHMENT',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditEntityType })
  entity_type: AuditEntityType;

  @Column({ nullable: true })
  entity_id: number;

  @Column({ nullable: true })
  actor_id: number;

  @Column({ nullable: true })
  actor: string; // 'SYSTEM' or username

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
