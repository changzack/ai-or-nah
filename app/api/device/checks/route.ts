import { NextResponse } from "next/server";
import { getFreeChecksRemaining } from "@/lib/db/fingerprints";
import { CommonErrors } from "@/lib/api/responses";

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
      return CommonErrors.missingParameter("fingerprint");
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
    return CommonErrors.internalError("Something went wrong. Please try again.");
  }
}
