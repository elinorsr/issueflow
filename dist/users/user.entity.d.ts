export declare enum UserRole {
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER"
}
export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
}
