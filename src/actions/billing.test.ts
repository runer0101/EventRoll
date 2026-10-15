import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  subscription: { findUnique: vi.fn(), upsert: vi.fn() },
}));

const stripeMock = vi.hoisted(() => ({
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
}));

// A plain function (not an arrow) so `new Stripe(...)` works in the action.
vi.mock('stripe', () => ({
  default: vi.fn(function StripeMock() {
    return stripeMock;
  }),
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/lib/session', () => ({ getOrganizationId: vi.fn() }));

import Stripe from 'stripe';
import { getOrganizationId } from '@/lib/session';
import { createCheckoutSession } from './billing';

const orgId = 'org_1';
const secretKey = 'sk_test_123';
const priceId = 'price_pro_123';
const appUrl = 'https://app.test';
const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_1';

function stubStripeEnv() {
  vi.stubEnv('STRIPE_SECRET_KEY', secretKey);
  vi.stubEnv('STRIPE_PRICE_PRO', priceId);
  vi.stubEnv('NEXT_PUBLIC_APP_URL', appUrl);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getOrganizationId).mockResolvedValue(orgId);
  prismaMock.subscription.findUnique.mockResolvedValue(null);
  prismaMock.subscription.upsert.mockResolvedValue({});
  stripeMock.customers.create.mockResolvedValue({ id: 'cus_new' });
  stripeMock.checkout.sessions.create.mockResolvedValue({ url: checkoutUrl });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createCheckoutSession', () => {
  it('rejects unauthenticated callers without calling Stripe', async () => {
    stubStripeEnv();
    vi.mocked(getOrganizationId).mockResolvedValue(null);

    const result = await createCheckoutSession();

    expect(result).toEqual({ success: false, error: 'No autenticado' });
    expect(stripeMock.customers.create).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('reports missing Stripe configuration without calling Stripe', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    vi.stubEnv('STRIPE_PRICE_PRO', '');

    const result = await createCheckoutSession();

    expect(result).toEqual({
      success: false,
      error:
        'Stripe no está configurado (faltan STRIPE_SECRET_KEY o STRIPE_PRICE_PRO)',
    });
    expect(vi.mocked(Stripe)).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it('reuses the stored customer and returns the checkout URL', async () => {
    stubStripeEnv();
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    });

    const result = await createCheckoutSession();

    expect(result).toEqual({ success: true, url: checkoutUrl });
    expect(vi.mocked(Stripe)).toHaveBeenCalledWith(secretKey);
    expect(stripeMock.customers.create).not.toHaveBeenCalled();
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith({
      mode: 'subscription',
      customer: 'cus_existing',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { organizationId: orgId } },
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    });
  });

  it('creates and persists a customer when the organization has none', async () => {
    stubStripeEnv();
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    stripeMock.customers.create.mockResolvedValue({ id: 'cus_new' });

    const result = await createCheckoutSession();

    expect(result).toEqual({ success: true, url: checkoutUrl });
    expect(stripeMock.customers.create).toHaveBeenCalledWith({
      metadata: { organizationId: orgId },
    });
    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith({
      where: { organizationId: orgId },
      update: { stripeCustomerId: 'cus_new' },
      create: { organizationId: orgId, stripeCustomerId: 'cus_new' },
    });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new' }),
    );
  });

  it('reports a checkout session without url as a payment failure', async () => {
    stubStripeEnv();
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    });
    stripeMock.checkout.sessions.create.mockResolvedValue({ url: null });

    const result = await createCheckoutSession();

    expect(result).toEqual({
      success: false,
      error: 'No se pudo iniciar el pago',
    });
  });

  it('does not leak Stripe errors to the caller', async () => {
    stubStripeEnv();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    });
    stripeMock.checkout.sessions.create.mockRejectedValue(
      new Error('Stripe connection error'),
    );

    const result = await createCheckoutSession();

    expect(result).toEqual({
      success: false,
      error: 'No se pudo conectar con Stripe',
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
