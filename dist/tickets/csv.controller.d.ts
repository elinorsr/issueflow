import { Response } from 'express';
import { CsvService } from './csv.service';
export declare class CsvController {
    private readonly csvService;
    constructor(csvService: CsvService);
    export(projectId: number, res: Response, user: any): Promise<void>;
    import(projectId: number, file: Express.Multer.File, user: any): Promise<{
        created: number;
        failed: number;
        errors: string[];
    }>;
}
