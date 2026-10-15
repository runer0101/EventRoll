import Stripe from 'stripe';
import { syncSubscriptionFromStripe } from '@/lib/billing';

/**
 * Stripe webhook endpoint: verifies the signature and mirrors subscription
 * changes into our database. Failing handlers return 500 so Stripe retries.
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return new Response('Stripe no está configurado', { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Falta la firma de Stripe', { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      webhookSecret,
    );
  } catch (e: unknown) {
    console.error('[stripe-webhook] invalid signature', e);
    return new Response('Firma inválida', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // The subscription id is enough to retrieve the full object; the
        // metadata set at Checkout creation carries the organization id.
        const ref = event.data.object.subscription;
        if (ref) {
          const subscriptionId = typeof ref === 'string' ? ref : ref.id;
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscriptionFromStripe(subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscriptionFromStripe(
          event.data.object as Stripe.Subscription,
        );
        break;
      }
      default:
        // Unknown event types are acknowledged and ignored.
        break;
    }
  } catch (e: unknown) {
    console.error('[stripe-webhook] handler error', e);
    return new Response('Error al procesar el evento', { status: 500 });
  }

  return new Response(null, { status: 200 });
}
