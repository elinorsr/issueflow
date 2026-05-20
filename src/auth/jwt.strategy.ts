import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenDenylistService } from './token-denylist.service';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly denylist: TokenDenylistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'issueflow-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && this.denylist.isDenied(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }
    return { id: payload.sub, username: payload.username, role: payload.role, jti: payload.jti };
  }
}
