import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { AuditService } from '../audit/audit.service';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

const mockUser: User = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  password: '$2b$10$hashedpassword',
  full_name: 'Alice Smith',
  role: UserRole.DEVELOPER,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and strip password', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockUser);
      mockRepo.save.mockResolvedValue(mockUser);

      const result = await service.create({
        username: 'alice',
        email: 'alice@example.com',
        full_name: 'Alice Smith',
        password: 'password123',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('alice');
    });

    it('should throw ConflictException if username exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          username: 'alice',
          email: 'new@example.com',
          full_name: 'Alice',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user without password', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return users without passwords', async () => {
      mockRepo.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });
  });
});
