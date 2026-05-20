"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
exports.databaseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'issueflow',
    password: process.env.DB_PASSWORD || 'issueflow',
    database: process.env.DB_NAME || 'issueflow',
    autoLoadEntities: true,
    synchronize: true,
};
//# sourceMappingURL=database.config.js.map