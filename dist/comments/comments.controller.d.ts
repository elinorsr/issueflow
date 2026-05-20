import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(ticketId: number, dto: CreateCommentDto): Promise<import("./comment.entity").Comment>;
    findByTicket(ticketId: number): Promise<import("./comment.entity").Comment[]>;
    update(id: number, dto: UpdateCommentDto): Promise<import("./comment.entity").Comment>;
    remove(id: number): Promise<void>;
}
