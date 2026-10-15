'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getOrganizationId } from '@/lib/session';
import { TicketTypeSchema } from '@/lib/validations/ticket-type';

export type TicketTypeActionResult =
  | { success: true }
  | { success: false; error?: string; errors?: Record<string, string[]> };

export async function createTicketType(
  eventId: string,
  data: unknown,
): Promise<TicketTypeActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) return { success: false, error: 'No autenticado' };

  const parsed = TicketTypeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizationId },
  });
  if (!event) return { success: false, error: 'Evento no encontrado' };

  await prisma.ticketType.create({
    data: { ...parsed.data, eventId, organizationId },
  });
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateTicketType(
  ticketTypeId: string,
  data: unknown,
): Promise<TicketTypeActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) return { success: false, error: 'No autenticado' };

  const parsed = TicketTypeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const updated = await prisma.ticketType.updateMany({
    where: { id: ticketTypeId, organizationId },
    data: parsed.data,
  });
  if (updated.count === 0) {
    return { success: false, error: 'Tipo de entrada no encontrado' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteTicketType(
  ticketTypeId: string,
): Promise<TicketTypeActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) return { success: false, error: 'No autenticado' };

  // Deleting a ticket type with sold tickets would destroy attendee data.
  const tickets = await prisma.ticket.count({
    where: { ticketTypeId, organizationId },
  });
  if (tickets > 0) {
    return {
      success: false,
      error: 'No se puede eliminar un tipo de entrada con tickets vendidos',
    };
  }

  const deleted = await prisma.ticketType.deleteMany({
    where: { id: ticketTypeId, organizationId },
  });
  if (deleted.count === 0) {
    return { success: false, error: 'Tipo de entrada no encontrado' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
