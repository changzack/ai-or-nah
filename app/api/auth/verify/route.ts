import { NextResponse } from "next/server";
import { validateOrigin, createCsrfError } from "@/lib/auth/csrf";
import { verifyCode } from "@/lib/auth/verification";
import { createSession } from "@/lib/auth/session";
import { getOrCreateCustomer } from "@/lib/db/customers";
import { migrateChecksToCustomer } from "@/lib/db/user-checks";

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
      return NextResponse.json(
        {
          status: "error",
          error: "missing_fields",
          message: "Please provide both email and code",
        },
        { status: 400 }
      );
    }

    // Verify code
    const result = await verifyCode(email, code);

    if (result.attemptsExceeded) {
      return NextResponse.json(
        {
          status: "error",
          error: "attempts_exceeded",
          message: "Too many incorrect attempts. Please request a new code.",
        },
        { status: 429 }
      );
    }

    if (!result.valid) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_code",
          message: "Invalid or expired code. Please try again.",
        },
        { status: 401 }
      );
    }

    // Get or create customer
    const customer = await getOrCreateCustomer(email);
    if (!customer) {
      return NextResponse.json(
        {
          status: "error",
          error: "customer_creation_failed",
          message: "Failed to create customer account. Please try again.",
        },
        { status: 500 }
      );
    }

    // Create session
    await createSession(customer.email, customer.id);

    // Migrate anonymous checks to customer account (if fingerprint provided)
    if (fingerprint) {
      await migrateChecksToCustomer(fingerprint, customer.id);
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
