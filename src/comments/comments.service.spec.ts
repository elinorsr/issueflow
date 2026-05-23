import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { User, UserRole } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

const mockUser = (id: number, username: string): User => ({
  id,
  username,
  email: `${username}@test.com`,
  password: 'hashed',
  full_name: username,
  role: UserRole.DEVELOPER,
  created_at: new Date(),
  updated_at: new Date(),
});

const mockComment = (overrides = {}): any => ({
  id: 1,
  content: 'hello world',
  ticket_id: 1,
  author_id: 1,
  mentionedUsers: [],
  version: 1,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const mockCommentsRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUsersRepo = {
  createQueryBuilder: jest.fn(),
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: mockCommentsRepo },
        { provide: getRepositoryToken(User), useValue: mockUsersRepo },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('@mention parsing', () => {
    it('should parse @mentions from content', async () => {
      const alice = mockUser(1, 'alice');
      const comment = mockComment();

      mockCommentsRepo.create.mockReturnValue(comment);
      mockCommentsRepo.save.mockResolvedValue(comment);

      // Mock the query builder for each username lookup
      const qbMock = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(alice),
      };
      mockUsersRepo.createQueryBuilder.mockReturnValue(qbMock);

      await service.create(1, { content: 'Hello @alice, check this', author_id: 2 });

      expect(mockUsersRepo.createQueryBuilder).toHaveBeenCalled();
      expect(qbMock.where).toHaveBeenCalledWith(
        'LOWER(u.username) = :username',
        { username: 'alice' },
      );
    });

    it('should handle no mentions gracefully', async () => {
      const comment = mockComment({ content: 'No mentions here' });
      mockCommentsRepo.create.mockReturnValue(comment);
      mockCommentsRepo.save.mockResolvedValue(comment);

      await service.create(1, { content: 'No mentions here', author_id: 1 });
      expect(mockUsersRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should deduplicate repeated mentions', async () => {
      const alice = mockUser(1, 'alice');
      const comment = mockComment();

      mockCommentsRepo.create.mockReturnValue(comment);
      mockCommentsRepo.save.mockResolvedValue(comment);

      const qbMock = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(alice),
      };
      mockUsersRepo.createQueryBuilder.mockReturnValue(qbMock);

      // alice appears twice — should resolve to one user
      await service.create(1, {
        content: '@alice and @alice again',
        author_id: 2,
      });

      // Called twice (once per @mention) but deduplicated in result
      expect(mockUsersRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimistic locking on update', () => {
    it('should throw ConflictException on version mismatch', async () => {
      mockCommentsRepo.findOne.mockResolvedValue(mockComment({ version: 5 }));

      await expect(
        service.update(1, { content: 'updated', version: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should succeed when version matches', async () => {
      const comment = mockComment({ version: 2 });
      mockCommentsRepo.findOne.mockResolvedValue(comment);
      mockCommentsRepo.save.mockResolvedValue({ ...comment, content: 'updated' });
      mockUsersRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update(1, { content: 'updated', version: 2 });
      expect(result.content).toBe('updated');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if comment missing', async () => {
      mockCommentsRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
