import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus, TicketPriority, TicketType } from './ticket.entity';
import { User, UserRole } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import { DependenciesService } from './dependencies.service';

const makeTicket = (overrides: any = {}): any => ({
  id: 1,
  title: 'Fix login bug',
  description: 'Users cannot log in',
  status: TicketStatus.TODO,
  priority: TicketPriority.MEDIUM,
  type: TicketType.BUG,
  project_id: 1,
  assignee_id: null,
  due_date: null,
  is_overdue: false,
  escalation_reset: false,
  version: 1,
  deleted_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const mockTicketsRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
  restore: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUsersRepo = {
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };
const mockDepsService = { hasUnresolvedBlockers: jest.fn().mockResolvedValue(false) };

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: mockTicketsRepo },
        { provide: getRepositoryToken(User), useValue: mockUsersRepo },
        { provide: AuditService, useValue: mockAuditService },
        { provide: DependenciesService, useValue: mockDepsService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    jest.clearAllMocks();
  });

  describe('status lifecycle', () => {
    it('should allow valid forward transition TODO → IN_PROGRESS', async () => {
      const ticket = makeTicket({ status: TicketStatus.TODO, version: 1 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);
      mockTicketsRepo.save.mockResolvedValue({ ...ticket, status: TicketStatus.IN_PROGRESS });

      const result = await service.update(1, { status: TicketStatus.IN_PROGRESS, version: 1 });
      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should reject backward transition IN_PROGRESS → TODO', async () => {
      const ticket = makeTicket({ status: TicketStatus.IN_PROGRESS, version: 1 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.update(1, { status: TicketStatus.TODO, version: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject skipping status IN_REVIEW → TODO', async () => {
      const ticket = makeTicket({ status: TicketStatus.IN_REVIEW, version: 1 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.update(1, { status: TicketStatus.TODO, version: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject any update on DONE ticket', async () => {
      const ticket = makeTicket({ status: TicketStatus.DONE, version: 1 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.update(1, { title: 'New title', version: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('optimistic locking', () => {
    it('should throw ConflictException on version mismatch', async () => {
      const ticket = makeTicket({ status: TicketStatus.TODO, version: 3 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.update(1, { title: 'Updated', version: 1 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should succeed when version matches', async () => {
      const ticket = makeTicket({ status: TicketStatus.TODO, version: 3 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);
      mockTicketsRepo.save.mockResolvedValue({ ...ticket, title: 'Updated' });

      const result = await service.update(1, { title: 'Updated', version: 3 });
      expect(result.title).toBe('Updated');
    });
  });

  describe('DONE blocker check', () => {
    it('should block DONE transition if unresolved blockers exist', async () => {
      const ticket = makeTicket({ status: TicketStatus.IN_REVIEW, version: 1 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);
      mockDepsService.hasUnresolvedBlockers.mockResolvedValue(true);

      await expect(
        service.update(1, { status: TicketStatus.DONE, version: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow DONE transition when all blockers resolved', async () => {
      const ticket = makeTicket({ status: TicketStatus.IN_REVIEW, version: 1 });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);
      mockDepsService.hasUnresolvedBlockers.mockResolvedValue(false);
      mockTicketsRepo.save.mockResolvedValue({ ...ticket, status: TicketStatus.DONE });

      const result = await service.update(1, { status: TicketStatus.DONE, version: 1 });
      expect(result.status).toBe(TicketStatus.DONE);
    });
  });

  describe('priority escalation reset', () => {
    it('should reset is_overdue when priority manually changed', async () => {
      const ticket = makeTicket({
        status: TicketStatus.TODO,
        priority: TicketPriority.HIGH,
        is_overdue: true,
        version: 1,
      });
      mockTicketsRepo.findOne.mockResolvedValue(ticket);
      mockTicketsRepo.save.mockImplementation(t => Promise.resolve(t));

      await service.update(1, { priority: TicketPriority.LOW, version: 1 });
      expect(ticket.is_overdue).toBe(false);
      expect(ticket.escalation_reset).toBe(true);
    });
  });
});
