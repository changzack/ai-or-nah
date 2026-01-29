import { NextResponse } from "next/server";
import { getFreeChecksRemaining } from "@/lib/db/fingerprints";

/**
 * Get free checks remaining for a device
 * POST /api/device/checks
 * Body: { "fingerprint": string, "deviceToken"?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprint, deviceToken } = body;

    if (!fingerprint) {
      return NextResponse.json(
        {
          status: "error",
          error: "missing_fingerprint",
          message: "Device fingerprint required",
        },
        { status: 400 }
      );
    }

    const freeChecksRemaining = await getFreeChecksRemaining(
      deviceToken || null,
      fingerprint
    );

    return NextResponse.json({
      status: "success",
      freeChecksRemaining,
    });
  } catch (error) {
    console.error("[device/checks] Error:", error);
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
