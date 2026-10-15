'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getOrganizationId } from '@/lib/session';

const CheckInSchema = z.object({
  qrCode: z.string().trim().min(1),
  eventId: z.string().trim().min(1),
});

/**
 * Server Action to validate a ticket QR code and check the attendee in.
 *
 * The PAID -> USED transition is performed with a conditional `updateMany`
 * (filtered by `status: 'PAID'`) so two concurrent scans of the same ticket
 * can never both succeed: the loser sees `count === 0` and gets the same
 * "already used" error as a sequential re-scan.
 */
export async function checkInTicket(
  qrCode: string,
  eventId: string,
): Promise<
  { success: true; attendeeName: string } | { success: false; error: string }
> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: 'No autenticado' };
  }

  const parseResult = CheckInSchema.safeParse({ qrCode, eventId });
  if (!parseResult.success) {
    return { success: false, error: 'Código inválido' };
  }
  const code = parseResult.data.qrCode;
  const eid = parseResult.data.eventId;

  try {
    // Tenant-scoped lookup: an organization can only check in its own tickets.
    const ticket = await prisma.ticket.findFirst({
      where: { qrCode: code, eventId: eid, organizationId },
    });

    if (!ticket) {
      return { success: false, error: 'Código no encontrado para este evento' };
    }
    if (ticket.status === 'PENDING') {
      return { success: false, error: 'El ticket aún no está pagado' };
    }
    if (ticket.status === 'CANCELLED') {
      return { success: false, error: 'Este ticket está cancelado' };
    }
    if (ticket.status === 'USED') {
      return { success: false, error: 'Este ticket ya fue usado' };
    }

    // Atomic transition: only one concurrent check-in can flip PAID -> USED.
    const updated = await prisma.ticket.updateMany({
      where: { qrCode: code, eventId: eid, organizationId, status: 'PAID' },
      data: { status: 'USED', checkedInAt: new Date() },
    });

    if (updated.count === 1) {
      return { success: true, attendeeName: ticket.attendeeName };
    }

    // The ticket was checked in concurrently after our read.
    return { success: false, error: 'Este ticket ya fue usado' };
  } catch (e: unknown) {
    // Never leak internal database details to the client.
    console.error('[checkInTicket] unexpected error', e);
    return { success: false, error: 'Error inesperado al validar el ticket' };
  }
}
