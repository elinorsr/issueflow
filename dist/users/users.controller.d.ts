import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { CommentsService } from '../comments/comments.service';
export declare class UsersController {
    private readonly usersService;
    private readonly commentsService;
    constructor(usersService: UsersService, commentsService: CommentsService);
    create(dto: CreateUserDto): Promise<Omit<import("./user.entity").User, "password">>;
    findAll(): Promise<Omit<import("./user.entity").User, "password">[]>;
    findOne(id: number): Promise<Omit<import("./user.entity").User, "password">>;
    getMentions(id: number): Promise<import("../comments/comment.entity").Comment[]>;
    update(id: number, dto: UpdateUserDto): Promise<Omit<import("./user.entity").User, "password">>;
    remove(id: number): Promise<void>;
}
