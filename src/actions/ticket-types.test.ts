import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  event: {
    findFirst: vi.fn(),
  },
  ticket: {
    count: vi.fn(),
  },
  ticketType: {
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/session', () => ({ getOrganizationId: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getOrganizationId } from '@/lib/session';
import {
  createTicketType,
  deleteTicketType,
  updateTicketType,
} from './ticket-types';

const validInput = { name: 'General', price: '25.50', stock: '100' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrganizationId).mockResolvedValue('org_1');
  prismaMock.event.findFirst.mockResolvedValue({ id: 'ev_1' });
  prismaMock.ticketType.create.mockResolvedValue({ id: 'tt_new' });
  prismaMock.ticketType.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.ticketType.deleteMany.mockResolvedValue({ count: 1 });
  prismaMock.ticket.count.mockResolvedValue(0);
});

describe('createTicketType', () => {
  it('rejects unauthenticated callers', async () => {
    vi.mocked(getOrganizationId).mockResolvedValue(null);

    const result = await createTicketType('ev_1', validInput);

    expect(result).toEqual({ success: false, error: 'No autenticado' });
    expect(prismaMock.ticketType.create).not.toHaveBeenCalled();
  });

  it('returns field errors for malformed prices', async () => {
    const result = await createTicketType('ev_1', {
      ...validInput,
      price: '12.345',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors?.price).toBeDefined();
    expect(prismaMock.ticketType.create).not.toHaveBeenCalled();
  });

  it('rejects events that are not part of the caller organization', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);

    const result = await createTicketType('ev_1', validInput);

    expect(result).toEqual({ success: false, error: 'Evento no encontrado' });
    expect(prismaMock.ticketType.create).not.toHaveBeenCalled();
  });

  it('creates the ticket type scoped to organization and event', async () => {
    const result = await createTicketType('ev_1', validInput);

    expect(result).toEqual({ success: true });
    expect(prismaMock.ticketType.create).toHaveBeenCalledWith({
      data: {
        name: 'General',
        price: '25.50',
        stock: 100,
        eventId: 'ev_1',
        organizationId: 'org_1',
      },
    });
  });
});

describe('updateTicketType', () => {
  it('updates only ticket types of the caller organization', async () => {
    const result = await updateTicketType('tt_1', {
      ...validInput,
      name: 'VIP',
      price: '99.00',
    });

    expect(result).toEqual({ success: true });
    expect(prismaMock.ticketType.updateMany).toHaveBeenCalledWith({
      where: { id: 'tt_1', organizationId: 'org_1' },
      data: { name: 'VIP', price: '99.00', stock: 100 },
    });
  });

  it('reports not found when the ticket type does not exist in the organization', async () => {
    prismaMock.ticketType.updateMany.mockResolvedValue({ count: 0 });

    const result = await updateTicketType('tt_1', validInput);

    expect(result).toEqual({
      success: false,
      error: 'Tipo de entrada no encontrado',
    });
  });
});

describe('deleteTicketType', () => {
  it('refuses to delete a ticket type with sold tickets', async () => {
    prismaMock.ticket.count.mockResolvedValue(2);

    const result = await deleteTicketType('tt_1');

    expect(result).toEqual({
      success: false,
      error: 'No se puede eliminar un tipo de entrada con tickets vendidos',
    });
    expect(prismaMock.ticketType.deleteMany).not.toHaveBeenCalled();
  });

  it('deletes the ticket type when there are no tickets', async () => {
    const result = await deleteTicketType('tt_1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.ticketType.deleteMany).toHaveBeenCalledWith({
      where: { id: 'tt_1', organizationId: 'org_1' },
    });
  });

  it('reports not found when nothing was deleted', async () => {
    prismaMock.ticketType.deleteMany.mockResolvedValue({ count: 0 });

    const result = await deleteTicketType('tt_1');

    expect(result).toEqual({
      success: false,
      error: 'Tipo de entrada no encontrado',
    });
  });
});
