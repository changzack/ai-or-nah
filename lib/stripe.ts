import Stripe from "stripe";
import { type CreditPackId } from "./constants";
import { getProduct, getStripePriceId } from "./db/products";

/**
 * Stripe client and utilities for payment processing
 */

// Lazy-initialize Stripe client
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeInstance;
}

/**
 * Get credit pack configuration by ID from database
 */
export async function getCreditPack(packId: string) {
  const product = await getProduct(packId.toLowerCase());
  if (!product) {
    console.error(`[stripe] Product not found: ${packId}`);
    return null;
  }

  const priceId = getStripePriceId(product);
  if (!priceId) {
    console.error(`[stripe] No price ID for product: ${packId}`);
    return null;
  }

  return {
    id: product.id,
    credits: product.credits,
    priceCents: product.price_cents,
    priceId,
  };
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(params: {
  packId: CreditPackId;
  customerEmail?: string;
  customerId?: string;
}): Promise<Stripe.Checkout.Session | null> {
  const pack = await getCreditPack(params.packId);

  if (!pack || !pack.priceId) {
    console.error("[stripe] Invalid pack or missing price ID");
    return null;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancelled`,
      customer_email: params.customerEmail,
      client_reference_id: params.customerId,
      metadata: {
        pack_id: params.packId,
        credits: pack.credits.toString(),
      },
    });

    return session;
  } catch (error) {
    console.error("[stripe] Checkout session creation failed");
    return null;
  }
}

/**
 * Get a Stripe Checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("[stripe] Session retrieval failed");
    return null;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe] Missing webhook secret");
    return null;
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error("[stripe] Webhook signature verification failed");
    return null;
  }
}
