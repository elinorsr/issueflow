import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { TokenDenylistService } from './token-denylist.service';
import { LoginDto } from './auth.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/audit-log.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly denylist: TokenDenylistService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const jti = uuidv4();
    const payload = { sub: user.id, username: user.username, role: user.role, jti };
    const access_token = this.jwtService.sign(payload);

    await this.auditService.log({
      action: AuditAction.LOGIN,
      entity_type: AuditEntityType.USER,
      entity_id: user.id,
      actor_id: user.id,
      actor: user.username,
      metadata: { jti },
    });

    return { access_token };
  }

  async logout(jti: string, actorId?: number, actorName?: string): Promise<void> {
    this.denylist.deny(jti);

    await this.auditService.log({
      action: AuditAction.LOGOUT,
      entity_type: AuditEntityType.USER,
      entity_id: actorId,
      actor_id: actorId,
      actor: actorName,
      metadata: { jti },
    });
  }
}
