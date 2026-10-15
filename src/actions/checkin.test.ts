import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  ticket: { findFirst: vi.fn(), updateMany: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/session', () => ({ getOrganizationId: vi.fn() }));

import { getOrganizationId } from '@/lib/session';
import { checkInTicket } from './checkin';

const orgId = 'org_1';
const eventId = 'ev_1';
const qrCode = 'qr_1';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrganizationId).mockResolvedValue(orgId);
  prismaMock.ticket.findFirst.mockResolvedValue(null);
  prismaMock.ticket.updateMany.mockResolvedValue({ count: 0 });
});

describe('checkInTicket', () => {
  it('rejects unauthenticated callers without touching the database', async () => {
    vi.mocked(getOrganizationId).mockResolvedValue(null);

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({ success: false, error: 'No autenticado' });
    expect(prismaMock.ticket.findFirst).not.toHaveBeenCalled();
  });

  it('rejects an empty code without touching the database', async () => {
    const result = await checkInTicket('   ', eventId);

    expect(result).toEqual({ success: false, error: 'Código inválido' });
    expect(prismaMock.ticket.findFirst).not.toHaveBeenCalled();
  });

  it('rejects a code that does not exist for the event', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue(null);

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({
      success: false,
      error: 'Código no encontrado para este evento',
    });
    expect(prismaMock.ticket.findFirst).toHaveBeenCalledWith({
      where: { qrCode, eventId, organizationId: orgId },
    });
    expect(prismaMock.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a ticket that has not been paid', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: 'tk_1',
      status: 'PENDING',
      attendeeName: 'Ada Lovelace',
    });

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({
      success: false,
      error: 'El ticket aún no está pagado',
    });
    expect(prismaMock.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a cancelled ticket', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: 'tk_1',
      status: 'CANCELLED',
      attendeeName: 'Ada Lovelace',
    });

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({
      success: false,
      error: 'Este ticket está cancelado',
    });
    expect(prismaMock.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a ticket that was already used', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: 'tk_1',
      status: 'USED',
      attendeeName: 'Ada Lovelace',
    });

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({
      success: false,
      error: 'Este ticket ya fue usado',
    });
    expect(prismaMock.ticket.updateMany).not.toHaveBeenCalled();
  });

  it('marks a paid ticket as used and returns the attendee name', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: 'tk_1',
      status: 'PAID',
      attendeeName: 'Ada Lovelace',
    });
    prismaMock.ticket.updateMany.mockResolvedValue({ count: 1 });

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({ success: true, attendeeName: 'Ada Lovelace' });
    expect(prismaMock.ticket.updateMany).toHaveBeenCalledWith({
      where: { qrCode, eventId, organizationId: orgId, status: 'PAID' },
      data: { status: 'USED', checkedInAt: expect.any(Date) },
    });
  });

  it('reports the ticket as already used when the atomic update loses the race', async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: 'tk_1',
      status: 'PAID',
      attendeeName: 'Ada Lovelace',
    });
    prismaMock.ticket.updateMany.mockResolvedValue({ count: 0 });

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({
      success: false,
      error: 'Este ticket ya fue usado',
    });
    expect(prismaMock.ticket.updateMany).toHaveBeenCalled();
  });

  it('does not leak unexpected database errors to the caller', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.ticket.findFirst.mockRejectedValue(
      new Error('relation "Ticket" does not exist'),
    );

    const result = await checkInTicket(qrCode, eventId);

    expect(result).toEqual({
      success: false,
      error: 'Error inesperado al validar el ticket',
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
