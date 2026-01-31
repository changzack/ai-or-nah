import { NextResponse } from "next/server";

/**
 * Debug endpoint to check environment configuration
 * Temporarily useful for troubleshooting CSRF issues
 * DELETE THIS FILE after fixing the issue
 */
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  return NextResponse.json({
    environment: {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    headers: {
      origin,
      referer,
      host,
    },
    timestamp: new Date().toISOString(),
  });
}
