'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getOrganizationId } from '@/lib/session';
import { EventSchema } from '@/lib/validations/event';

export type EventActionResult =
  | { success: true }
  | { success: false; error?: string; errors?: Record<string, string[]> };

export async function createEvent(data: unknown): Promise<EventActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) return { success: false, error: 'No autenticado' };

  const parsed = EventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.event.create({ data: { ...parsed.data, organizationId } });
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateEvent(
  eventId: string,
  data: unknown,
): Promise<EventActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) return { success: false, error: 'No autenticado' };

  const parsed = EventSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const updated = await prisma.event.updateMany({
    where: { id: eventId, organizationId },
    data: parsed.data,
  });
  if (updated.count === 0) {
    return { success: false, error: 'Evento no encontrado' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteEvent(eventId: string): Promise<EventActionResult> {
  const organizationId = await getOrganizationId();
  if (!organizationId) return { success: false, error: 'No autenticado' };

  // Deleting an event with sold tickets would destroy attendee data.
  const tickets = await prisma.ticket.count({
    where: { eventId, organizationId },
  });
  if (tickets > 0) {
    return {
      success: false,
      error: 'No se puede eliminar un evento con tickets registrados',
    };
  }

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.ticketType.deleteMany({ where: { eventId, organizationId } });
    return tx.event.deleteMany({ where: { id: eventId, organizationId } });
  });
  if (deleted.count === 0) {
    return { success: false, error: 'Evento no encontrado' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
