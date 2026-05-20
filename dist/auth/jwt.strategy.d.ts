import { Strategy } from 'passport-jwt';
import { TokenDenylistService } from './token-denylist.service';
export interface JwtPayload {
    sub: number;
    username: string;
    role: string;
    jti: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly denylist;
    constructor(denylist: TokenDenylistService);
    validate(req: any, payload: JwtPayload): Promise<{
        id: number;
        username: string;
        role: string;
        jti: string;
    }>;
}
export {};
