/**
 * Quick script to verify Supabase database connection and tables
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testDatabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase environment variables");
    console.log("Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
    process.exit(1);
  }

  console.log("🔗 Connecting to Supabase...");
  console.log(`   URL: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Test 1: Check if results table exists
  console.log("\n📊 Testing results table...");
  const { data: resultsData, error: resultsError } = await supabase
    .from("results")
    .select("count")
    .limit(1);

  if (resultsError) {
    console.error("❌ Error accessing results table:", resultsError.message);
  } else {
    console.log("✅ Results table accessible");
  }

  // Test 2: Check if result_images table exists
  console.log("\n🖼️  Testing result_images table...");
  const { data: imagesData, error: imagesError } = await supabase
    .from("result_images")
    .select("count")
    .limit(1);

  if (imagesError) {
    console.error("❌ Error accessing result_images table:", imagesError.message);
  } else {
    console.log("✅ Result_images table accessible");
  }

  // Test 3: Check if ip_rate_limits table exists
  console.log("\n🚦 Testing ip_rate_limits table...");
  const { data: rateLimitData, error: rateLimitError } = await supabase
    .from("ip_rate_limits")
    .select("count")
    .limit(1);

  if (rateLimitError) {
    console.error("❌ Error accessing ip_rate_limits table:", rateLimitError.message);
  } else {
    console.log("✅ IP_rate_limits table accessible");
  }

  // Test 4: Check storage bucket
  console.log("\n🗄️  Testing analyzed-images storage bucket...");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.error("❌ Error listing buckets:", bucketError.message);
  } else {
    const analyzedBucket = buckets?.find((b) => b.name === "analyzed-images");
    if (analyzedBucket) {
      console.log("✅ Analyzed-images bucket exists");
    } else {
      console.error("❌ Analyzed-images bucket not found");
      console.log("   Available buckets:", buckets?.map((b) => b.name).join(", "));
    }
  }

  // Test 5: Count existing results
  console.log("\n📈 Checking existing cached results...");
  const { count, error: countError } = await supabase
    .from("results")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Error counting results:", countError.message);
  } else {
    console.log(`✅ Found ${count || 0} cached results in database`);
  }

  console.log("\n✨ Database connection test complete!");
}

testDatabaseConnection().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
