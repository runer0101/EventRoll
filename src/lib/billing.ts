import type { Subscription, SubscriptionStatus } from '@prisma/client';
import type Stripe from 'stripe';
import prisma from '@/lib/prisma';

/** Active (upcoming) events allowed by the FREE plan. */
export const FREE_PLAN_MAX_ACTIVE_EVENTS = 1;

/**
 * An organization counts as PRO only while Stripe reports an active
 * subscription whose paid period has not expired.
 */
export function isSubscriptionActive(
  subscription: Pick<Subscription, 'status' | 'currentPeriodEnd'> | null,
): boolean {
  if (!subscription || subscription.status !== 'ACTIVE') return false;
  if (
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd <= new Date()
  ) {
    return false;
  }
  return true;
}

export async function getSubscription(organizationId: string) {
  return prisma.subscription.findUnique({ where: { organizationId } });
}

/**
 * Entitlement check used before creating events: PRO organizations are
 * unlimited; FREE organizations can keep a single active (upcoming) event.
 */
export async function canCreateEvent(
  organizationId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getSubscription(organizationId);
  if (isSubscriptionActive(subscription)) return { allowed: true };

  const activeEvents = await prisma.event.count({
    where: { organizationId, date: { gte: new Date() } },
  });
  if (activeEvents >= FREE_PLAN_MAX_ACTIVE_EVENTS) {
    return {
      allowed: false,
      reason:
        'Tu plan FREE permite 1 evento activo. Activa PRO para publicar más eventos.',
    };
  }
  return { allowed: true };
}

export function mapStripeStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    default:
      return 'CANCELED';
  }
}

/**
 * Mirrors a Stripe subscription into our database. Subscriptions not created
 * by this app (no `organizationId` metadata) are ignored.
 */
export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
): Promise<void> {
  const organizationId = subscription.metadata?.organizationId;
  if (!organizationId) return;

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  // The billing period lives on subscription items in the current Stripe API.
  const periodEnd = subscription.items.data[0]?.current_period_end;

  const data = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: mapStripeStatus(subscription.status),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
  };

  await prisma.subscription.upsert({
    where: { organizationId },
    update: data,
    create: { organizationId, ...data },
  });
}
