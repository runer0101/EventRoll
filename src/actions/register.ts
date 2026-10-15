'use server';

import { AttendeeSchema } from '@/lib/validations/attendee';
import prisma from '@/lib/prisma';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventForOrganization } from '@/lib/queries/events';
import { nanoid } from 'nanoid';

/** Domain error whose message is safe to return to the caller. */
class RegistrationError extends Error {}

/**
 * Server Action to register an attendee and create a ticket.
 *
 * Concurrency guarantees (S5):
 * - The event row is locked (`FOR UPDATE`) so the capacity check is serial
 *   across concurrent registrations of the same event.
 * - Stock is decremented with a conditional `updateMany` (`stock > 0`), so
 *   the counter can never drop below zero even under races.
 */
export async function registerAttendee(
  data: unknown,
  orgSlug: string,
  eventId: string,
): Promise<
  | { success: true; ticketId: string; qrCode: string }
  | { success: false; errors?: Record<string, string[]>; error?: string }
> {
  // 1️⃣ Validate payload
  const parseResult = AttendeeSchema.safeParse(data);
  if (!parseResult.success) {
    return { success: false, errors: parseResult.error.flatten().fieldErrors };
  }
  const { name, email, ticketTypeId } = parseResult.data;

  // 2️⃣ Resolve organization & event
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) {
    return { success: false, error: 'Organización no encontrada' };
  }
  const event = await getEventForOrganization(eventId, org.id);
  if (!event) {
    return { success: false, error: 'Evento no encontrado' };
  }

  // 3️⃣ Transaction: capacity check, conditional stock decrement, ticket creation
  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findFirst({
        where: { id: ticketTypeId, eventId: event.id, organizationId: org.id },
      });
      if (!ticketType) {
        throw new RegistrationError('Tipo de ticket inválido');
      }

      // Lock the event row so concurrent registrations check capacity serially.
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${event.id} FOR UPDATE`;

      const activeTickets = await tx.ticket.count({
        where: { eventId: event.id, status: { not: 'CANCELLED' } },
      });
      if (activeTickets >= event.capacity) {
        throw new RegistrationError('El evento alcanzó su capacidad máxima');
      }

      // Conditional decrement: fails when another registration took the last spot.
      const decremented = await tx.ticketType.updateMany({
        where: {
          id: ticketType.id,
          eventId: event.id,
          organizationId: org.id,
          stock: { gt: 0 },
        },
        data: { stock: { decrement: 1 } },
      });
      if (decremented.count !== 1) {
        throw new RegistrationError(
          'Sin stock disponible para este tipo de ticket',
        );
      }

      // Free ticket types grant a ready-to-use ticket; paid ones stay pending.
      const status = ticketType.price.equals(0) ? 'PAID' : 'PENDING';

      const ticket = await tx.ticket.create({
        data: {
          qrCode: nanoid(21),
          status,
          attendeeName: name,
          attendeeEmail: email,
          ticketTypeId: ticketType.id,
          eventId: event.id,
          organizationId: org.id,
        },
        select: { id: true, qrCode: true },
      });

      return ticket;
    });

    return { success: true, ticketId: result.id, qrCode: result.qrCode };
  } catch (e: unknown) {
    if (e instanceof RegistrationError) {
      return { success: false, error: e.message };
    }
    // Never leak internal database details to the client.
    console.error('[registerAttendee] unexpected error', e);
    return { success: false, error: 'Error inesperado al registrar' };
  }
}
