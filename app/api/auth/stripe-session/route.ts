import { NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/db/customers";
import { createSession } from "@/lib/auth/session";

/**
 * Create session from Stripe checkout
 * POST /api/auth/stripe-session
 * Body: { sessionId: string }
 *
 * This endpoint:
 * 1. Verifies the Stripe session
 * 2. Gets/creates the customer
 * 3. Creates an authenticated session
 * 4. Returns the customer's credits
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          status: "error",
          error: "missing_session_id",
          message: "Stripe session ID required",
        },
        { status: 400 }
      );
    }

    console.log("[stripe-session] Verifying session:", sessionId);

    // Get the Stripe session
    const stripeSession = await getCheckoutSession(sessionId);
    if (!stripeSession) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_session",
          message: "Invalid or expired Stripe session",
        },
        { status: 400 }
      );
    }

    // Verify payment was successful
    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json(
        {
          status: "error",
          error: "payment_not_completed",
          message: "Payment not completed",
        },
        { status: 400 }
      );
    }

    // Get customer email from Stripe session
    const customerEmail =
      stripeSession.customer_email ||
      stripeSession.customer_details?.email;

    if (!customerEmail) {
      return NextResponse.json(
        {
          status: "error",
          error: "missing_email",
          message: "No email found in Stripe session",
        },
        { status: 400 }
      );
    }

    console.log("[stripe-session] Creating session for:", customerEmail);

    // Get or create customer
    const customer = await getOrCreateCustomer(customerEmail);
    if (!customer) {
      return NextResponse.json(
        {
          status: "error",
          error: "customer_creation_failed",
          message: "Failed to create customer account",
        },
        { status: 500 }
      );
    }

    // Create authenticated session
    await createSession(customer.email, customer.id);

    console.log(
      "[stripe-session] Session created, credits:",
      customer.credits
    );

    return NextResponse.json({
      status: "success",
      email: customer.email,
      credits: customer.credits,
    });
  } catch (error) {
    console.error("[stripe-session] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "internal_error",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
