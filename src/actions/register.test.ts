import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({ $transaction: vi.fn() }));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/organization', () => ({ getOrganizationBySlug: vi.fn() }));
vi.mock('@/lib/queries/events', () => ({ getEventForOrganization: vi.fn() }));

import { getOrganizationBySlug } from '@/lib/organization';
import { getEventForOrganization } from '@/lib/queries/events';
import { registerAttendee } from './register';

const org = { id: 'org_1', name: 'Demo', slug: 'demo' };

function makeTx() {
  return {
    $queryRaw: vi.fn().mockResolvedValue([{ id: 'ev_1' }]),
    ticketType: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    ticket: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
  };
}

type Tx = ReturnType<typeof makeTx>;

let tx: Tx;

beforeEach(() => {
  vi.clearAllMocks();
  tx = makeTx();
  prismaMock.$transaction.mockImplementation(
    (callback: (tx: Tx) => Promise<unknown>) => callback(tx),
  );
  vi.mocked(getOrganizationBySlug).mockResolvedValue(org as never);
  vi.mocked(getEventForOrganization).mockResolvedValue({
    id: 'ev_1',
    capacity: 100,
  } as never);
});

const validInput = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  ticketTypeId: 'tt_1',
};

describe('registerAttendee', () => {
  it('rejects invalid payloads without touching the database', async () => {
    const result = await registerAttendee(
      { ...validInput, email: 'not-an-email' },
      'demo',
      'ev_1',
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors).toBeDefined();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a ticket type that does not belong to the event', async () => {
    tx.ticketType.findFirst.mockResolvedValue(null);

    const result = await registerAttendee(validInput, 'demo', 'ev_1');

    expect(result).toEqual({ success: false, error: 'Tipo de ticket inválido' });
    expect(tx.ticketType.updateMany).not.toHaveBeenCalled();
  });

  it('rejects when the conditional stock decrement finds no stock left', async () => {
    tx.ticketType.findFirst.mockResolvedValue({
      id: 'tt_1',
      price: new Prisma.Decimal('25.50'),
      stock: 1,
    });
    tx.ticketType.updateMany.mockResolvedValue({ count: 0 });

    const result = await registerAttendee(validInput, 'demo', 'ev_1');

    expect(result).toEqual({
      success: false,
      error: 'Sin stock disponible para este tipo de ticket',
    });
    expect(tx.ticket.create).not.toHaveBeenCalled();
  });

  it('decrements stock conditionally and creates a pending ticket for paid types', async () => {
    tx.ticketType.findFirst.mockResolvedValue({
      id: 'tt_1',
      price: new Prisma.Decimal('25.50'),
      stock: 10,
    });
    tx.ticketType.updateMany.mockResolvedValue({ count: 1 });
    tx.ticket.create.mockResolvedValue({ id: 'tk_1', qrCode: 'qr_1' });

    const result = await registerAttendee(validInput, 'demo', 'ev_1');

    expect(result).toEqual({ success: true, ticketId: 'tk_1', qrCode: 'qr_1' });
    expect(tx.ticketType.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'tt_1',
        eventId: 'ev_1',
        organizationId: 'org_1',
        stock: { gt: 0 },
      },
      data: { stock: { decrement: 1 } },
    });
    expect(tx.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING' }) }),
    );
  });

  it('marks free tickets as paid', async () => {
    tx.ticketType.findFirst.mockResolvedValue({
      id: 'tt_1',
      price: new Prisma.Decimal('0'),
      stock: 10,
    });
    tx.ticketType.updateMany.mockResolvedValue({ count: 1 });
    tx.ticket.create.mockResolvedValue({ id: 'tk_1', qrCode: 'qr_1' });

    await registerAttendee(validInput, 'demo', 'ev_1');

    expect(tx.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PAID' }) }),
    );
  });

  it('rejects when the event has reached its capacity', async () => {
    vi.mocked(getEventForOrganization).mockResolvedValue({
      id: 'ev_1',
      capacity: 5,
    } as never);
    tx.ticket.count.mockResolvedValue(5);
    tx.ticketType.findFirst.mockResolvedValue({
      id: 'tt_1',
      price: new Prisma.Decimal('25.50'),
      stock: 10,
    });

    const result = await registerAttendee(validInput, 'demo', 'ev_1');

    expect(result).toEqual({
      success: false,
      error: 'El evento alcanzó su capacidad máxima',
    });
    expect(tx.ticketType.updateMany).not.toHaveBeenCalled();
  });

  it('does not leak unexpected database errors to the caller', async () => {
    tx.ticketType.findFirst.mockResolvedValue({
      id: 'tt_1',
      price: new Prisma.Decimal('25.50'),
      stock: 10,
    });
    tx.ticketType.updateMany.mockResolvedValue({ count: 1 });
    tx.ticket.create.mockRejectedValue(
      new Error('relation "Ticket" violates constraint ...'),
    );

    const result = await registerAttendee(validInput, 'demo', 'ev_1');

    expect(result).toEqual({
      success: false,
      error: 'Error inesperado al registrar',
    });
  });
});
