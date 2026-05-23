import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TokenDenylistService } from './token-denylist.service';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuditModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'issueflow-secret',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, TokenDenylistService],
  controllers: [AuthController],
  exports: [TokenDenylistService],
})
export class AuthModule {}
