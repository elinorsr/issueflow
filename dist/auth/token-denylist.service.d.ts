export declare class TokenDenylistService {
    private readonly denied;
    deny(jti: string): void;
    isDenied(jti: string): boolean;
}
