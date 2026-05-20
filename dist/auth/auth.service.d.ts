import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TokenDenylistService } from './token-denylist.service';
import { LoginDto } from './auth.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly denylist;
    constructor(usersService: UsersService, jwtService: JwtService, denylist: TokenDenylistService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    logout(jti: string): void;
}
