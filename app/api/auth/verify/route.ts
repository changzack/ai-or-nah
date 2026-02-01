import { NextResponse } from "next/server";
import { validateOrigin, createCsrfError } from "@/lib/auth/csrf";
import { verifyCode } from "@/lib/auth/verification";
import { createSession } from "@/lib/auth/session";
import { getOrCreateCustomer } from "@/lib/db/customers";
import { migrateChecksToCustomer } from "@/lib/db/user-checks";
import { errorResponse, CommonErrors } from "@/lib/api/responses";

/**
 * Verify code and create session
 * POST /api/auth/verify
 * Body: { "email": "user@example.com", "code": "123456", "fingerprint"?: "device_fingerprint" }
 */
export async function POST(request: Request) {
  // CSRF validation
  if (!validateOrigin(request)) {
    return createCsrfError();
  }

  try {
    const body = await request.json();
    const { email, code, fingerprint } = body;

    if (!email || !code) {
      return errorResponse("missing_fields", "Please provide both email and code", 400);
    }

    // Verify code
    const result = await verifyCode(email, code);

    if (result.attemptsExceeded) {
      return errorResponse("attempts_exceeded", "Too many incorrect attempts. Please request a new code.", 429);
    }

    if (!result.valid) {
      return CommonErrors.invalidCode("Invalid or expired code. Please try again.");
    }

    // Get or create customer
    const customer = await getOrCreateCustomer(email);
    if (!customer) {
      return errorResponse("customer_creation_failed", "Failed to create customer account. Please try again.", 500);
    }

    // Create session
    try {
      await createSession(customer.email, customer.id);
    } catch (sessionError) {
      console.error("[verify] Error creating session:", sessionError);
      return errorResponse("session_creation_failed", "Failed to create session. Please try again.", 500);
    }

    // Migrate anonymous checks to customer account (if fingerprint provided)
    // This is non-critical, so we don't fail verification if it errors
    if (fingerprint) {
      try {
        await migrateChecksToCustomer(fingerprint, customer.id);
      } catch (migrateError) {
        console.error("[verify] Error migrating checks (non-critical):", migrateError);
        // Continue anyway - migration is not critical for login
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Verification successful",
      customer: {
        email: customer.email,
        credits: customer.credits,
      },
    });
  } catch (error) {
    console.error("[verify] Error:", error);
    return CommonErrors.internalError("Something went wrong. Please try again.");
  }
}
