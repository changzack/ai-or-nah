import { NextResponse } from "next/server";
import { validateOrigin, createCsrfError } from "@/lib/auth/csrf";
import { clearSession } from "@/lib/auth/session";

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
export async function POST(request: Request) {
  // CSRF validation
  if (!validateOrigin(request)) {
    return createCsrfError();
  }

  try {
    await clearSession();

    return NextResponse.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[logout] Error:", error);
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
