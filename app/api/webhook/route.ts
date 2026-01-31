import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { getOrCreateCustomer, addCredits, updateStripeCustomerId } from "@/lib/db/customers";
import { recordPurchase } from "@/lib/db/purchases";

// Disable body parsing so we can get raw body for signature verification
export const runtime = 'nodejs';

/**
 * Stripe webhook handler
 * POST /api/webhook
 * Handles checkout.session.completed events
 */
export async function POST(request: Request) {
  try {
    // Get signature from request headers directly
    const signature = request.headers.get("stripe-signature");

    // Get raw body for signature verification
    const body = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);
    if (!event) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const stripeSessionId = session.id;

      // Extract data
      const customerEmail = session.customer_email || session.customer_details?.email;
      const stripeCustomerId = session.customer;
      const amountTotal = session.amount_total;
      const credits = parseInt(session.metadata?.credits || "0", 10);

      if (!customerEmail || !credits) {
        console.error("[webhook] Missing required data for session:", stripeSessionId);
        return NextResponse.json(
          { error: "Missing required data" },
          { status: 400 }
        );
      }

      // Get or create customer
      const customer = await getOrCreateCustomer(customerEmail);
      if (!customer) {
        console.error("[webhook] Failed to get/create customer for session:", stripeSessionId);
        return NextResponse.json(
          { error: "Customer creation failed" },
          { status: 500 }
        );
      }

      // Update Stripe customer ID if needed
      if (stripeCustomerId && !customer.stripeCustomerId) {
        await updateStripeCustomerId(customer.id, stripeCustomerId);
      }

      // Record purchase (with idempotency check)
      const isNew = await recordPurchase({
        customerId: customer.id,
        stripeSessionId: stripeSessionId,
        creditsPurchased: credits,
        amountCents: amountTotal,
      });

      if (!isNew) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      // Add credits to customer
      const success = await addCredits(customer.id, credits, "purchase");
      if (!success) {
        console.error("[webhook] Failed to add credits for session:", stripeSessionId);
        return NextResponse.json(
          { error: "Failed to add credits" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Processing error");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
