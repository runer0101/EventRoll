import type { Subscription } from '@prisma/client';
import type Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  subscription: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  event: {
    count: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import {
  canCreateEvent,
  isSubscriptionActive,
  mapStripeStatus,
  syncSubscriptionFromStripe,
} from './billing';

function subscription(overrides: Partial<Subscription>): Subscription {
  return {
    id: 'sub_1',
    organizationId: 'org_1',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_stripe_1',
    status: 'NONE',
    currentPeriodEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Subscription;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isSubscriptionActive', () => {
  it('is false without a subscription', () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it('is false for non-active statuses', () => {
    expect(isSubscriptionActive(subscription({ status: 'CANCELED' }))).toBe(false);
    expect(isSubscriptionActive(subscription({ status: 'PAST_DUE' }))).toBe(false);
    expect(isSubscriptionActive(subscription({ status: 'NONE' }))).toBe(false);
  });

  it('is true for an active subscription without a period end', () => {
    expect(isSubscriptionActive(subscription({ status: 'ACTIVE' }))).toBe(true);
  });

  it('is true for an active subscription within the paid period', () => {
    const tomorrow = new Date(Date.now() + 86_400_000);
    expect(
      isSubscriptionActive(subscription({ status: 'ACTIVE', currentPeriodEnd: tomorrow })),
    ).toBe(true);
  });

  it('is false when the paid period has expired', () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    expect(
      isSubscriptionActive(subscription({ status: 'ACTIVE', currentPeriodEnd: yesterday })),
    ).toBe(false);
  });
});

describe('canCreateEvent', () => {
  it('allows PRO organizations regardless of event count', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(
      subscription({ status: 'ACTIVE' }),
    );

    const result = await canCreateEvent('org_1');

    expect(result).toEqual({ allowed: true });
    expect(prismaMock.event.count).not.toHaveBeenCalled();
  });

  it('allows a first active event on the FREE plan', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.event.count.mockResolvedValue(0);

    const result = await canCreateEvent('org_1');

    expect(result).toEqual({ allowed: true });
    expect(prismaMock.event.count).toHaveBeenCalledWith({
      where: { organizationId: 'org_1', date: { gte: expect.any(Date) } },
    });
  });

  it('blocks additional active events on the FREE plan', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.event.count.mockResolvedValue(1);

    const result = await canCreateEvent('org_1');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('FREE');
  });
});

describe('mapStripeStatus', () => {
  it('maps Stripe subscription statuses to local ones', () => {
    expect(mapStripeStatus('active')).toBe('ACTIVE');
    expect(mapStripeStatus('trialing')).toBe('ACTIVE');
    expect(mapStripeStatus('past_due')).toBe('PAST_DUE');
    expect(mapStripeStatus('canceled')).toBe('CANCELED');
    expect(mapStripeStatus('unpaid')).toBe('CANCELED');
  });
});

describe('syncSubscriptionFromStripe', () => {
  const stripeSubscription = {
    id: 'sub_stripe_9',
    customer: 'cus_9',
    status: 'active',
    metadata: { organizationId: 'org_1' },
    items: { data: [{ current_period_end: 1_800_000_000 }] },
  } as unknown as Stripe.Subscription;

  it('upserts the subscription by organization', async () => {
    await syncSubscriptionFromStripe(stripeSubscription);

    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith({
      where: { organizationId: 'org_1' },
      update: expect.objectContaining({
        stripeCustomerId: 'cus_9',
        stripeSubscriptionId: 'sub_stripe_9',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(1_800_000_000 * 1000),
      }),
      create: expect.objectContaining({ organizationId: 'org_1', status: 'ACTIVE' }),
    });
  });

  it('ignores subscriptions created outside this app', async () => {
    await syncSubscriptionFromStripe({
      ...stripeSubscription,
      metadata: {},
    } as unknown as Stripe.Subscription);

    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });
});
