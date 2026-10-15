import type Stripe from 'stripe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const stripeMock = vi.hoisted(() => ({
  webhooks: { constructEvent: vi.fn() },
  subscriptions: { retrieve: vi.fn() },
}));

// A plain function (not an arrow) so `new Stripe(...)` works in the route.
vi.mock('stripe', () => ({
  default: vi.fn(function StripeMock() {
    return stripeMock;
  }),
}));
vi.mock('@/lib/billing', () => ({ syncSubscriptionFromStripe: vi.fn() }));

import { syncSubscriptionFromStripe } from '@/lib/billing';
import { POST } from './route';

const secretKey = 'sk_test_123';
const webhookSecret = 'whsec_123';

const stripeSubscription = {
  id: 'sub_1',
  customer: 'cus_1',
  status: 'active',
  metadata: { organizationId: 'org_1' },
  items: { data: [{ current_period_end: 1_800_000_000 }] },
} as unknown as Stripe.Subscription;

function webhookRequest(
  headers: Record<string, string> = { 'stripe-signature': 'sig_1' },
) {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers,
    body: '{}',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('STRIPE_SECRET_KEY', secretKey);
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', webhookSecret);
  stripeMock.subscriptions.retrieve.mockResolvedValue(stripeSubscription);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('POST /api/stripe/webhook', () => {
  it('returns 503 when Stripe is not configured', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');

    const response = await POST(webhookRequest());

    expect(response.status).toBe(503);
    expect(stripeMock.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it('returns 400 when the signature header is missing', async () => {
    const response = await POST(webhookRequest({}));

    expect(response.status).toBe(400);
    expect(stripeMock.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it('returns 400 when signature verification fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Firma inválida');
    expect(syncSubscriptionFromStripe).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('retrieves and syncs the subscription on checkout.session.completed', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { subscription: 'sub_1' } },
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(stripeMock.subscriptions.retrieve).toHaveBeenCalledWith('sub_1');
    expect(syncSubscriptionFromStripe).toHaveBeenCalledWith(stripeSubscription);
  });

  it('ignores checkout.session.completed without a subscription', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { subscription: null } },
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(stripeMock.subscriptions.retrieve).not.toHaveBeenCalled();
    expect(syncSubscriptionFromStripe).not.toHaveBeenCalled();
  });

  it('syncs the subscription on customer.subscription.updated', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: { object: stripeSubscription },
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(syncSubscriptionFromStripe).toHaveBeenCalledWith(stripeSubscription);
  });

  it('syncs the subscription on customer.subscription.deleted', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: stripeSubscription },
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(syncSubscriptionFromStripe).toHaveBeenCalledWith(stripeSubscription);
  });

  it('ignores unknown event types', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: { object: {} },
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    expect(syncSubscriptionFromStripe).not.toHaveBeenCalled();
  });

  it('returns 500 so Stripe retries when a handler fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { subscription: 'sub_1' } },
    });
    stripeMock.subscriptions.retrieve.mockRejectedValue(
      new Error('Stripe is down'),
    );

    const response = await POST(webhookRequest());

    expect(response.status).toBe(500);
    expect(syncSubscriptionFromStripe).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
