import prisma from '@/lib/prisma';

/**
 * Get all events that belong to a given organization.
 */
export const getEventsByOrganization = async (organizationId: string) => {
  return await prisma.event.findMany({
    where: { organizationId },
    orderBy: { date: 'asc' },
  });
};

/**
 * Get a single event ensuring it belongs to the specified organization.
 */
export const getEventForOrganization = async (
  eventId: string,
  organizationId: string,
) => {
  return await prisma.event.findFirst({
    where: { id: eventId, organizationId },
  });
};

/**
 * Get ticket types for a specific event within an organization.
 */
export const getTicketTypesForEvent = async (
  eventId: string,
  organizationId: string,
) => {
  return await prisma.ticketType.findMany({
    where: { eventId, organizationId },
  });
};
