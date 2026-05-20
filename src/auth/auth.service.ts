import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { TokenDenylistService } from './token-denylist.service';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly denylist: TokenDenylistService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const jti = uuidv4();
    const payload = { sub: user.id, username: user.username, role: user.role, jti };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  logout(jti: string): void {
    this.denylist.deny(jti);
  }
}
