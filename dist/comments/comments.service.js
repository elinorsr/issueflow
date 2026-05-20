"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./comment.entity");
const user_entity_1 = require("../users/user.entity");
let CommentsService = class CommentsService {
    constructor(commentsRepo, usersRepo) {
        this.commentsRepo = commentsRepo;
        this.usersRepo = usersRepo;
    }
    async create(ticket_id, dto) {
        const comment = this.commentsRepo.create({ ...dto, ticket_id });
        const saved = await this.commentsRepo.save(comment);
        const mentioned = await this.resolveMentions(dto.content);
        saved.mentionedUsers = mentioned;
        return this.commentsRepo.save(saved);
    }
    async findByTicket(ticket_id) {
        return this.commentsRepo.find({
            where: { ticket_id },
            relations: ['author', 'mentionedUsers'],
            order: { created_at: 'ASC' },
        });
    }
    async update(id, dto) {
        const comment = await this.commentsRepo.findOne({
            where: { id },
            relations: ['mentionedUsers'],
        });
        if (!comment)
            throw new common_1.NotFoundException(`Comment ${id} not found`);
        if (dto.version !== undefined && dto.version !== comment.version) {
            throw new common_1.ConflictException('Comment was modified by another user. Please refresh and try again.');
        }
        comment.content = dto.content;
        comment.mentionedUsers = await this.resolveMentions(dto.content);
        return this.commentsRepo.save(comment);
    }
    async remove(id) {
        const comment = await this.commentsRepo.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException(`Comment ${id} not found`);
        await this.commentsRepo.remove(comment);
    }
    async findMentionsForUser(userId) {
        return this.commentsRepo
            .createQueryBuilder('c')
            .innerJoin('c.mentionedUsers', 'u', 'u.id = :userId', { userId })
            .leftJoinAndSelect('c.mentionedUsers', 'mu')
            .leftJoinAndSelect('c.author', 'a')
            .orderBy('c.created_at', 'DESC')
            .getMany();
    }
    parseMentionUsernames(content) {
        const matches = content.match(/@(\w+)/g) ?? [];
        return matches.map(m => m.slice(1).toLowerCase());
    }
    async resolveMentions(content) {
        const usernames = this.parseMentionUsernames(content);
        if (!usernames.length)
            return [];
        const users = await Promise.all(usernames.map(username => this.usersRepo
            .createQueryBuilder('u')
            .where('LOWER(u.username) = :username', { username })
            .getOne()));
        const seen = new Set();
        return users.filter(u => {
            if (!u || seen.has(u.id))
                return false;
            seen.add(u.id);
            return true;
        });
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CommentsService);
//# sourceMappingURL=comments.service.js.map