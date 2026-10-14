'use server';

import { AttendeeSchema } from '@/lib/validations/attendee';
import prisma from '@/lib/prisma';
import { getOrganizationBySlug } from '@/lib/organization';
import { getEventForOrganization } from '@/lib/queries/events';
import { nanoid } from 'nanoid';

/**
 * Server Action to register an attendee and create a ticket.
 * Returns an object indicating success or validation errors.
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

  // 3️⃣ Transaction: verify ticket type, stock and create ticket
  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findFirst({
        where: { id: ticketTypeId, eventId: event.id, organizationId: org.id },
      });
      if (!ticketType) {
        throw new Error('Tipo de ticket inválido');
      }
      if (ticketType.stock <= 0) {
        throw new Error('Sin stock disponible para este tipo de ticket');
      }

      // Decrement stock
      await tx.ticketType.update({
        where: { id: ticketType.id },
        data: { stock: { decrement: 1 } },
      });

      // Determine status based on price
      const priceZero = ticketType.price.equals(0);
      const status = priceZero ? 'PAID' : 'PENDING';

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
    if (e instanceof Error) {
      return { success: false, error: e.message };
    }
    return { success: false, error: 'Error inesperado al registrar' };
  }
}
