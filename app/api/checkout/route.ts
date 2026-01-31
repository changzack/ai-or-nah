import { NextResponse } from "next/server";
import { validateOrigin, createCsrfError } from "@/lib/auth/csrf";
import { getSession } from "@/lib/auth/session";
import { createCheckoutSession } from "@/lib/stripe";
import type { CreditPackId } from "@/lib/constants";

/**
 * Create Stripe Checkout session
 * POST /api/checkout
 * Body: { "packId": "small" | "medium" | "large" }
 */
export async function POST(request: Request) {
  // CSRF validation
  if (!validateOrigin(request)) {
    return createCsrfError();
  }

  try {
    const body = await request.json();
    const { packId } = body;

    if (!packId || !["small", "medium", "large"].includes(packId)) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_pack",
          message: "Please select a valid credit pack",
        },
        { status: 400 }
      );
    }

    // Get session for customer info (optional)
    const session = await getSession();

    // Create Stripe Checkout session
    const checkoutSession = await createCheckoutSession({
      packId: packId as CreditPackId,
      customerEmail: session?.email,
      customerId: session?.customerId,
    });

    if (!checkoutSession) {
      console.error("[checkout] Failed to create checkout session");
      return NextResponse.json(
        {
          status: "error",
          error: "checkout_failed",
          message: "Failed to create checkout session. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("[checkout] Error:", error);
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
