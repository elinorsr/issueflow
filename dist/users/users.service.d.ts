import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: Repository<User>);
    create(dto: CreateUserDto): Promise<Omit<User, 'password'>>;
    findAll(): Promise<Omit<User, 'password'>[]>;
    findOne(id: number): Promise<Omit<User, 'password'>>;
    findByUsername(username: string): Promise<User | null>;
    findByUsernameInsensitive(username: string): Promise<User | null>;
    update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password'>>;
    remove(id: number): Promise<void>;
    private strip;
}
