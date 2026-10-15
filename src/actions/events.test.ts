import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  event: {
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  ticket: {
    count: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/session', () => ({ getOrganizationId: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getOrganizationId } from '@/lib/session';
import { createEvent, deleteEvent, updateEvent } from './events';

function makeDeleteTx() {
  return {
    ticketType: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
    event: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
  };
}

type DeleteTx = ReturnType<typeof makeDeleteTx>;

const validInput = {
  title: 'Sunset Fest 2026',
  description: 'Festival de música en vivo con bandas locales.',
  date: '2026-12-01T18:00',
  location: 'Plaza Mayor',
  capacity: '50',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrganizationId).mockResolvedValue('org_1');
  prismaMock.event.create.mockResolvedValue({ id: 'ev_new' });
  prismaMock.event.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.ticket.count.mockResolvedValue(0);
});

describe('createEvent', () => {
  it('rejects unauthenticated callers', async () => {
    vi.mocked(getOrganizationId).mockResolvedValue(null);

    const result = await createEvent(validInput);

    expect(result).toEqual({ success: false, error: 'No autenticado' });
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('returns field errors for invalid payloads', async () => {
    const result = await createEvent({ ...validInput, title: 'x', capacity: '0' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors?.title).toBeDefined();
      expect(result.errors?.capacity).toBeDefined();
    }
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('creates the event scoped to the caller organization', async () => {
    const result = await createEvent(validInput);

    expect(result).toEqual({ success: true });
    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Sunset Fest 2026',
        location: 'Plaza Mayor',
        capacity: 50,
        date: expect.any(Date),
        organizationId: 'org_1',
      }),
    });
  });
});

describe('updateEvent', () => {
  it('updates only events of the caller organization', async () => {
    const result = await updateEvent('ev_1', validInput);

    expect(result).toEqual({ success: true });
    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: { id: 'ev_1', organizationId: 'org_1' },
      data: expect.objectContaining({ capacity: 50 }),
    });
  });

  it('reports not found when the event belongs to another organization', async () => {
    prismaMock.event.updateMany.mockResolvedValue({ count: 0 });

    const result = await updateEvent('ev_1', validInput);

    expect(result).toEqual({ success: false, error: 'Evento no encontrado' });
  });
});

describe('deleteEvent', () => {
  it('refuses to delete an event that has tickets', async () => {
    prismaMock.ticket.count.mockResolvedValue(3);

    const result = await deleteEvent('ev_1');

    expect(result).toEqual({
      success: false,
      error: 'No se puede eliminar un evento con tickets registrados',
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deletes ticket types and the event inside a transaction', async () => {
    const tx = makeDeleteTx();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: DeleteTx) => Promise<unknown>) => callback(tx),
    );

    const result = await deleteEvent('ev_1');

    expect(result).toEqual({ success: true });
    expect(tx.ticketType.deleteMany).toHaveBeenCalledWith({
      where: { eventId: 'ev_1', organizationId: 'org_1' },
    });
    expect(tx.event.deleteMany).toHaveBeenCalledWith({
      where: { id: 'ev_1', organizationId: 'org_1' },
    });
  });

  it('reports not found when nothing was deleted', async () => {
    const tx = makeDeleteTx();
    tx.event.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: DeleteTx) => Promise<unknown>) => callback(tx),
    );

    const result = await deleteEvent('ev_1');

    expect(result).toEqual({ success: false, error: 'Evento no encontrado' });
  });
});
