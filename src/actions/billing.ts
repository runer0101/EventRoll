'use server';

import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getOrganizationId } from '@/lib/session';

/**
 * Server Action that starts a PRO subscription Checkout Session.
 *
 * The Stripe customer is reused when it already exists on the subscription
 * row; otherwise it is created and persisted before opening Checkout. The
 * local status stays NONE until the webhook confirms the subscription.
 */
export async function createCheckoutSession(): Promise<
  { success: true; url: string } | { success: false; error: string }
> {
  const organizationId = await getOrganizationId();
  if (!organizationId) {
    return { success: false, error: 'No autenticado' };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_PRO;
  if (!secretKey || !priceId) {
    return {
      success: false,
      error:
        'Stripe no está configurado (faltan STRIPE_SECRET_KEY o STRIPE_PRICE_PRO)',
    };
  }

  const stripe = new Stripe(secretKey);

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    let stripeCustomerId = subscription?.stripeCustomerId ?? null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { organizationId },
      });
      stripeCustomerId = customer.id;
      await prisma.subscription.upsert({
        where: { organizationId },
        update: { stripeCustomerId },
        create: { organizationId, stripeCustomerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { organizationId } },
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    });

    if (!session.url) {
      return { success: false, error: 'No se pudo iniciar el pago' };
    }

    return { success: true, url: session.url };
  } catch (e: unknown) {
    // Never leak internal Stripe/database details to the client.
    console.error('[createCheckoutSession] unexpected error', e);
    return { success: false, error: 'No se pudo conectar con Stripe' };
  }
}
