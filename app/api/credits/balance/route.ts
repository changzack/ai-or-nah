import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCustomerById } from "@/lib/db/customers";

/**
 * Get credits balance endpoint
 * GET /api/credits/balance
 * Returns credits for authenticated users, or free checks info for anonymous
 */
export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getSession();

    if (!session) {
      // Anonymous user - return free tier info
      return NextResponse.json({
        status: "success",
        authenticated: false,
        freeChecksRemaining: null, // Will be determined by fingerprint
      });
    }

    // Get customer credits
    const customer = await getCustomerById(session.customerId);
    if (!customer) {
      return NextResponse.json(
        {
          status: "error",
          error: "customer_not_found",
          message: "Customer account not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      authenticated: true,
      email: customer.email,
      credits: customer.credits,
    });
  } catch (error) {
    console.error("[credits/balance] Error:", error);
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
