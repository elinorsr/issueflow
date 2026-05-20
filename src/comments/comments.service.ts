import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(ticket_id: number, dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepo.create({ ...dto, ticket_id });
    const saved = await this.commentsRepo.save(comment);

    // Parse and attach mentions
    const mentioned = await this.resolveMentions(dto.content);
    saved.mentionedUsers = mentioned;
    return this.commentsRepo.save(saved);
  }

  async findByTicket(ticket_id: number): Promise<Comment[]> {
    return this.commentsRepo.find({
      where: { ticket_id },
      relations: ['author', 'mentionedUsers'],
      order: { created_at: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateCommentDto): Promise<Comment> {
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
    return this.commentsRepo.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);
    await this.commentsRepo.remove(comment);
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

    return { data, total, page, pageSize };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

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
