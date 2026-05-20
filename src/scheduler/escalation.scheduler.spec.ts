import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EscalationScheduler } from './escalation.scheduler';
import { Ticket, TicketPriority, TicketStatus, TicketType } from '../tickets/ticket.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

const makeOverdueTicket = (priority: TicketPriority, overrides: any = {}): any => ({
  id: 1,
  title: 'Overdue ticket',
  description: null,
  status: TicketStatus.IN_PROGRESS,
  priority,
  type: TicketType.BUG,
  project_id: 1,
  assignee_id: null,
  due_date: new Date(Date.now() - 86400000), // yesterday
  is_overdue: false,
  escalation_reset: false,
  version: 1,
  deleted_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const mockTicketsRepo = {
  find: jest.fn(),
  save: jest.fn(),
};

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('EscalationScheduler', () => {
  let scheduler: EscalationScheduler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscalationScheduler,
        { provide: getRepositoryToken(Ticket), useValue: mockTicketsRepo },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    scheduler = module.get<EscalationScheduler>(EscalationScheduler);
    jest.clearAllMocks();
  });

  it('should escalate LOW → MEDIUM', async () => {
    const ticket = makeOverdueTicket(TicketPriority.LOW);
    mockTicketsRepo.find.mockResolvedValue([ticket]);
    mockTicketsRepo.save.mockImplementation(t => Promise.resolve(t));

    await scheduler.escalateOverdueTickets();

    expect(ticket.priority).toBe(TicketPriority.MEDIUM);
    expect(ticket.is_overdue).toBe(false);
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.ESCALATE }),
    );
  });

  it('should escalate HIGH → CRITICAL and set is_overdue', async () => {
    const ticket = makeOverdueTicket(TicketPriority.HIGH);
    mockTicketsRepo.find.mockResolvedValue([ticket]);
    mockTicketsRepo.save.mockImplementation(t => Promise.resolve(t));

    await scheduler.escalateOverdueTickets();

    expect(ticket.priority).toBe(TicketPriority.CRITICAL);
    expect(ticket.is_overdue).toBe(true);
  });

  it('should not escalate beyond CRITICAL', async () => {
    const ticket = makeOverdueTicket(TicketPriority.CRITICAL, { is_overdue: false });
    mockTicketsRepo.find.mockResolvedValue([ticket]);
    mockTicketsRepo.save.mockImplementation(t => Promise.resolve(t));

    await scheduler.escalateOverdueTickets();

    expect(ticket.priority).toBe(TicketPriority.CRITICAL);
    expect(ticket.is_overdue).toBe(true);
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });

  it('should skip escalation if escalation_reset is true', async () => {
    const ticket = makeOverdueTicket(TicketPriority.LOW, { escalation_reset: true });
    mockTicketsRepo.find.mockResolvedValue([ticket]);
    mockTicketsRepo.save.mockImplementation(t => Promise.resolve(t));

    await scheduler.escalateOverdueTickets();

    expect(ticket.priority).toBe(TicketPriority.LOW); // unchanged
    expect(ticket.escalation_reset).toBe(false); // flag cleared
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });

  it('should do nothing when no overdue tickets', async () => {
    mockTicketsRepo.find.mockResolvedValue([]);

    await scheduler.escalateOverdueTickets();

    expect(mockTicketsRepo.save).not.toHaveBeenCalled();
    expect(mockAuditService.log).not.toHaveBeenCalled();
  });
});
