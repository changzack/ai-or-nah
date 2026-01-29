import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Test database connection to monetization tables
 * GET /api/test-db
 */
export async function GET() {
  const supabase = createServerClient();

  console.log("[test-db] Testing database connection...");

  // Test 1: Can we query device_fingerprints?
  const { data: fingerprints, error: fpError } = await supabase
    .from("device_fingerprints")
    .select("*")
    .limit(1);

  console.log("[test-db] device_fingerprints query result:", { data: fingerprints, error: fpError });

  // Test 2: Can we insert?
  const { data: insertData, error: insertError } = await supabase
    .from("device_fingerprints")
    .insert({
      fingerprint_hash: "test_hash_" + Date.now(),
      checks_used: 0,
    })
    .select()
    .single();

  console.log("[test-db] Insert result:", { data: insertData, error: insertError });

  // Test 3: Check customers table
  const { data: customers, error: custError } = await supabase
    .from("customers")
    .select("*")
    .limit(1);

  console.log("[test-db] customers query result:", { data: customers, error: custError });

  return NextResponse.json({
    status: "debug",
    tests: {
      device_fingerprints_query: {
        success: !fpError,
        error: fpError,
        data: fingerprints,
      },
      device_fingerprints_insert: {
        success: !insertError,
        error: insertError,
        data: insertData,
      },
      customers_query: {
        success: !custError,
        error: custError,
        data: customers,
      },
    },
  });
}
