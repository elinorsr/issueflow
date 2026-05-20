import { User } from '../users/user.entity';
export declare class Project {
    id: number;
    name: string;
    description: string;
    owner_id: number;
    owner: User;
    deleted_at: Date;
    created_at: Date;
    updated_at: Date;
}
