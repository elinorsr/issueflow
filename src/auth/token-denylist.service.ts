import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenDenylistService {
  private readonly denied = new Set<string>();

  deny(jti: string): void {
    this.denied.add(jti);
  }

  isDenied(jti: string): boolean {
    return this.denied.has(jti);
  }
}
