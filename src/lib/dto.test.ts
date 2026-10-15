import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { toPublicTicketType } from './dto';

describe('toPublicTicketType', () => {
  it('serializes the price as a fixed 2-decimal string', () => {
    const result = toPublicTicketType({
      id: 'tt_1',
      name: 'General',
      price: new Prisma.Decimal('25.5'),
      stock: 10,
    });

    expect(result).toEqual({
      id: 'tt_1',
      name: 'General',
      price: '25.50',
      stock: 10,
    });
  });

  it('returns a plain object that survives the server/client boundary', () => {
    const result = toPublicTicketType({
      id: 'tt_2',
      name: 'VIP',
      price: new Prisma.Decimal('99'),
      stock: 3,
    });

    expect(typeof result.price).toBe('string');
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});
