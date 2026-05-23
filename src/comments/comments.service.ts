import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';

type MentionedUser = { id: number; username: string; fullName: string };

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    ticket_id: number,
    dto: CreateCommentDto,
    actorId?: number,
    actorName?: string,
  ): Promise<Comment> {
    // author_id always comes from the authenticated user — never from the request body
    const comment = this.commentsRepo.create({ ...dto, ticket_id, author_id: actorId });
    const saved = await this.commentsRepo.save(comment);

    // Parse and attach mentions
    const mentioned = await this.resolveMentions(dto.content);
    saved.mentionedUsers = mentioned;
    const result = await this.commentsRepo.save(saved);

    await this.auditService.log({
      action: AuditAction.CREATE,
      entity_type: AuditEntityType.COMMENT,
      entity_id: result.id,
      actor_id: actorId,
      actor: actorName,
      metadata: { ticket_id, mentions: mentioned.map(u => u.username) },
    });

    return this.formatComment(result);
  }

  async findByTicket(ticket_id: number): Promise<Comment[]> {
    const comments = await this.commentsRepo.find({
      where: { ticket_id },
      relations: ['author', 'mentionedUsers'],
      order: { created_at: 'ASC' },
    });
    return comments.map(c => this.formatComment(c));
  }

  async update(
    id: number,
    dto: UpdateCommentDto,
    actorId?: number,
    actorName?: string,
  ): Promise<Comment> {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['mentionedUsers'],
    });
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);

    // Optimistic locking
    if (dto.version !== undefined && dto.version !== comment.version) {
      throw new ConflictException(
        'Comment was modified by another user. Please refresh and try again.',
      );
    }

    comment.content = dto.content;
    // Re-evaluate mentions on update
    comment.mentionedUsers = await this.resolveMentions(dto.content);
    const result = await this.commentsRepo.save(comment);

    await this.auditService.log({
      action: AuditAction.UPDATE,
      entity_type: AuditEntityType.COMMENT,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
      metadata: { mentions: comment.mentionedUsers.map(u => u.username) },
    });

    return this.formatComment(result);
  }

  async remove(
    id: number,
    actorId?: number,
    actorName?: string,
  ): Promise<void> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);
    await this.commentsRepo.remove(comment);

    await this.auditService.log({
      action: AuditAction.DELETE,
      entity_type: AuditEntityType.COMMENT,
      entity_id: id,
      actor_id: actorId,
      actor: actorName,
      metadata: { ticket_id: comment.ticket_id },
    });
  }

  async findMentionsForUser(
    userId: number,
    page = 1,
    pageSize = 20,
  ): Promise<{ data: Comment[]; total: number; page: number; pageSize: number }> {
    const [data, total] = await this.commentsRepo
      .createQueryBuilder('c')
      .innerJoin('c.mentionedUsers', 'u', 'u.id = :userId', { userId })
      .leftJoinAndSelect('c.mentionedUsers', 'mu')
      .leftJoinAndSelect('c.author', 'a')
      .orderBy('c.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { data: data.map(c => this.formatComment(c)), total, page, pageSize };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Strip sensitive fields and format mentionedUsers per API spec */
  private formatComment(comment: Comment): Comment {
    if (comment.mentionedUsers) {
      (comment as any).mentionedUsers = comment.mentionedUsers.map(
        (u): MentionedUser => ({ id: u.id, username: u.username, fullName: u.full_name }),
      );
    }
    if (comment.author) {
      const { password, ...safeAuthor } = comment.author as any;
      (comment as any).author = safeAuthor;
    }
    return comment;
  }

  private parseMentionUsernames(content: string): string[] {
    const matches = content.match(/@(\w+)/g) ?? [];
    return matches.map(m => m.slice(1).toLowerCase());
  }

  private async resolveMentions(content: string): Promise<User[]> {
    const usernames = this.parseMentionUsernames(content);
    if (!usernames.length) return [];

    const users = await Promise.all(
      usernames.map(username =>
        this.usersRepo
          .createQueryBuilder('u')
          .where('LOWER(u.username) = :username', { username })
          .getOne(),
      ),
    );

    // Deduplicate and filter nulls
    const seen = new Set<number>();
    return users.filter(u => {
      if (!u || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    }) as User[];
  }
}
