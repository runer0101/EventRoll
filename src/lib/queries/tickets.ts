import prisma from '@/lib/prisma';

/**
 * Obtiene un ticket por id asegurando que pertenece a la organización indicada.
 */
export const getTicketByIdForOrganization = async (ticketId: string, organizationId: string) => {
  return await prisma.ticket.findFirst({
    where: { id: ticketId, organizationId },
    include: { event: true, ticketType: true },
  });
};

/**
 * Estadísticas de tickets por evento dentro de una organización.
 * Devuelve un array con { eventId, eventTitle, total, paid, pending }.
 */
export const getTicketStatsByOrganization = async (organizationId: string) => {
  const tickets = await prisma.ticket.findMany({
    where: { organizationId },
    include: { event: { select: { id: true, title: true } } },
  });

  const map = new Map<string, { eventId: string; eventTitle: string; total: number; paid: number; pending: number }>();

  for (const t of tickets) {
    if (!t.event) continue;
    const key = t.event.id;
    const existing = map.get(key) ?? { eventId: key, eventTitle: t.event.title, total: 0, paid: 0, pending: 0 };
    existing.total += 1;
    if (t.status === 'PAID') existing.paid += 1;
    else if (t.status === 'PENDING') existing.pending += 1;
    map.set(key, existing);
  }

  return Array.from(map.values());
};

/**
 * Obtiene todos los tickets de un evento concreto dentro de una organización.
 */
export const getTicketsByEvent = async (eventId: string, organizationId: string) => {
  return await prisma.ticket.findMany({
    where: { eventId, organizationId },
    include: { ticketType: true },
  });
};
