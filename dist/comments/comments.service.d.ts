import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
export declare class CommentsService {
    private readonly commentsRepo;
    private readonly usersRepo;
    constructor(commentsRepo: Repository<Comment>, usersRepo: Repository<User>);
    create(ticket_id: number, dto: CreateCommentDto): Promise<Comment>;
    findByTicket(ticket_id: number): Promise<Comment[]>;
    update(id: number, dto: UpdateCommentDto): Promise<Comment>;
    remove(id: number): Promise<void>;
    findMentionsForUser(userId: number): Promise<Comment[]>;
    private parseMentionUsernames;
    private resolveMentions;
}
