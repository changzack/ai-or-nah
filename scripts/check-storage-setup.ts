/**
 * Check Supabase Storage bucket configuration
 * Run with: npx tsx scripts/check-storage-setup.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function checkStorageSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
  }

  console.log("🔍 Checking Supabase Storage Setup...\n");
  console.log(`URL: ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. List all buckets
  console.log("📦 Checking buckets...");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error("❌ Error listing buckets:", bucketsError.message);
    process.exit(1);
  }

  console.log(`Found ${buckets?.length || 0} bucket(s):`);
  buckets?.forEach((bucket) => {
    console.log(`  - ${bucket.name} (public: ${bucket.public})`);
  });

  // 2. Check analyzed-images bucket specifically
  console.log("\n🎯 Checking 'analyzed-images' bucket...");
  const analyzedBucket = buckets?.find((b) => b.name === "analyzed-images");

  if (!analyzedBucket) {
    console.error("❌ 'analyzed-images' bucket NOT FOUND");
    console.log("\n📋 Next steps:");
    console.log("1. Go to Supabase Dashboard > Storage");
    console.log("2. Create a new bucket named 'analyzed-images'");
    console.log("3. Enable 'Public bucket' option");
    console.log("4. Run this script again to verify");
    process.exit(1);
  }

  console.log("✅ Bucket exists");
  console.log(`   Public: ${analyzedBucket.public}`);

  if (!analyzedBucket.public) {
    console.error("\n⚠️  WARNING: Bucket is NOT public!");
    console.log("📋 To fix:");
    console.log("1. Go to Supabase Dashboard > Storage > analyzed-images");
    console.log("2. Click 'Settings'");
    console.log("3. Enable 'Public bucket'");
    console.log("4. Save changes");
  }

  // 3. Try to list files
  console.log("\n📁 Testing file access...");
  const { data: files, error: listError } = await supabase.storage
    .from("analyzed-images")
    .list("", { limit: 5 });

  if (listError) {
    console.error("❌ Error listing files:", listError.message);
  } else {
    console.log(`✅ Can access bucket (found ${files?.length || 0} files/folders)`);
    if (files && files.length > 0) {
      console.log("   Sample entries:");
      files.slice(0, 3).forEach((file) => {
        console.log(`   - ${file.name}`);
      });
    }
  }

  // 4. Test upload capability
  console.log("\n🧪 Testing upload capability...");
  const testFileName = `test-${Date.now()}.txt`;
  const testContent = "Test file for storage verification";

  const { error: uploadError } = await supabase.storage
    .from("analyzed-images")
    .upload(testFileName, testContent, {
      contentType: "text/plain",
    });

  if (uploadError) {
    console.error("❌ Upload test failed:", uploadError.message);
    console.log("\n📋 This might mean:");
    console.log("- Missing storage policies");
    console.log("- Insufficient service role permissions");
  } else {
    console.log("✅ Upload test successful");

    // Clean up test file
    await supabase.storage.from("analyzed-images").remove([testFileName]);
    console.log("   (Test file cleaned up)");
  }

  // 5. Test public URL generation
  console.log("\n🔗 Testing public URL generation...");
  const { data: urlData } = supabase.storage
    .from("analyzed-images")
    .getPublicUrl("test/sample.jpg");

  console.log(`✅ Public URL format: ${urlData.publicUrl}`);

  console.log("\n✨ Storage setup check complete!");
  console.log("\nIf you see errors above, follow the suggested fixes.");
  console.log("Once fixed, images should load properly on Vercel.");
}

checkStorageSetup().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
