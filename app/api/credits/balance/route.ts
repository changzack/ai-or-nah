import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCustomerById } from "@/lib/db/customers";
import { CommonErrors } from "@/lib/api/responses";

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
      return CommonErrors.notFound("Customer account not found");
    }

    return NextResponse.json({
      status: "success",
      authenticated: true,
      email: customer.email,
      credits: customer.credits,
    });
  } catch (error) {
    console.error("[credits/balance] Error:", error);
    return CommonErrors.internalError("Something went wrong. Please try again.");
  }
}
