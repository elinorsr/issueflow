import { UserRole } from './user.entity';
export declare class CreateUserDto {
    username: string;
    email: string;
    full_name: string;
    password: string;
    role?: UserRole;
}
export declare class UpdateUserDto {
    full_name?: string;
    role?: UserRole;
}
