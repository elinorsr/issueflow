import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    logout(user: any): {
        message: string;
    };
    me(user: any): Promise<Omit<import("../users/user.entity").User, "password">>;
}
