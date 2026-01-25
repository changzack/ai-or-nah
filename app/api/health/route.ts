import { NextResponse } from "next/server";

/**
 * Health check endpoint to verify environment variables are configured
 */
export async function GET() {
  const checks = {
    apify: !!process.env.APIFY_API_TOKEN,
    sightengine: !!(process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET),
    supabase: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  };

  const allConfigured = Object.values(checks).every((v) => v === true);

  return NextResponse.json({
    status: allConfigured ? "healthy" : "misconfigured",
    environment: process.env.VERCEL_ENV || "development",
    checks,
    missing: {
      apify: !checks.apify ? ["APIFY_API_TOKEN"] : [],
      sightengine: !checks.sightengine
        ? ["SIGHTENGINE_API_USER", "SIGHTENGINE_API_SECRET"]
        : [],
      supabase: !checks.supabase
        ? [
            !process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
            !process.env.SUPABASE_SERVICE_ROLE_KEY ? "SUPABASE_SERVICE_ROLE_KEY" : null,
          ].filter(Boolean)
        : [],
    },
    message: allConfigured
      ? "All services configured correctly"
      : "Missing required environment variables - see 'missing' object for details",
  });
}
