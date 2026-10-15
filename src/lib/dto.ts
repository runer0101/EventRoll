import type { Prisma } from '@prisma/client';

/**
 * Plain, JSON-serializable representation of a ticket type.
 *
 * Prisma `Decimal` values cannot cross the server/client boundary: when a
 * client component receives one as a prop, React serialization strips its
 * prototype and methods like `toFixed` disappear at render time. Prices are
 * therefore formatted to a fixed two-decimal string on the server.
 */
export interface PublicTicketType {
  id: string;
  name: string;
  price: string;
  stock: number;
}

export function toPublicTicketType(ticketType: {
  id: string;
  name: string;
  price: Prisma.Decimal;
  stock: number;
}): PublicTicketType {
  return {
    id: ticketType.id,
    name: ticketType.name,
    price: ticketType.price.toFixed(2),
    stock: ticketType.stock,
  };
}
