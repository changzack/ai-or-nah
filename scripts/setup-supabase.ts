/**
 * Supabase Setup Script
 *
 * Runs database migrations and sets up storage bucket
 *
 * Usage: npx tsx scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigrations() {
  console.log('\n📊 Running database migrations...\n');

  try {
    // Read migration files
    const migration1 = readFileSync(
      join(process.cwd(), 'supabase/migrations/001_init.sql'),
      'utf-8'
    );
    const migration2 = readFileSync(
      join(process.cwd(), 'supabase/migrations/002_functions.sql'),
      'utf-8'
    );

    // Execute migrations using raw SQL
    console.log('   → Running 001_init.sql...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 }).single();

    if (error1) {
      // Try alternative method: direct query
      const { error: altError1 } = await supabase
        .from('_migrations')
        .insert({ name: '001_init', sql: migration1 });

      if (altError1) {
        console.log('   ⚠️  Note: Migration may already be applied or need manual setup');
        console.log('   You can run migrations manually in Supabase SQL Editor:');
        console.log(`   ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_/sql`);
      }
    } else {
      console.log('   ✅ 001_init.sql completed');
    }

    console.log('   → Running 002_functions.sql...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 }).single();

    if (error2) {
      console.log('   ⚠️  Note: Migration may already be applied');
    } else {
      console.log('   ✅ 002_functions.sql completed');
    }

  } catch (err) {
    console.log('   ⚠️  Could not run migrations via API');
    console.log('\n📝 Please run migrations manually:');
    console.log(`   1. Go to: ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_/sql`);
    console.log('   2. Copy contents of supabase/migrations/001_init.sql');
    console.log('   3. Paste and run in SQL Editor');
    console.log('   4. Repeat for 002_functions.sql\n');
  }
}

async function setupStorage() {
  console.log('\n📦 Setting up storage bucket...\n');

  try {
    const bucketName = 'analyzed-images';

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (bucketExists) {
      console.log(`   ✅ Bucket '${bucketName}' already exists`);
    } else {
      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true, // Images need to be publicly accessible
        fileSizeLimit: 5242880, // 5MB max per image
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });

      if (error) {
        console.error(`   ❌ Failed to create bucket: ${error.message}`);
        console.log('\n📝 Please create bucket manually:');
        console.log(`   1. Go to: ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_/storage/buckets`);
        console.log(`   2. Create new bucket named: ${bucketName}`);
        console.log('   3. Set as public');
        console.log('   4. Set file size limit: 5MB');
        console.log('   5. Allowed MIME types: image/jpeg, image/png, image/webp\n');
      } else {
        console.log(`   ✅ Created bucket '${bucketName}'`);
      }
    }
  } catch (err) {
    console.error('   ❌ Storage setup error:', err);
  }
}

async function testConnection() {
  console.log('\n🔍 Testing database connection...\n');

  try {
    // Test basic query
    const { data, error } = await supabase
      .from('results')
      .select('count')
      .limit(1);

    if (error) {
      console.error(`   ❌ Connection test failed: ${error.message}`);
      return false;
    }

    console.log('   ✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('   ❌ Connection test failed:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Setup Starting...');
  console.log(`   URL: ${SUPABASE_URL}`);

  await runMigrations();
  await setupStorage();
  const connected = await testConnection();

  console.log('\n' + '='.repeat(50));
  if (connected) {
    console.log('✅ Supabase setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Test the full flow: analyze an Instagram account');
    console.log('   3. Check stored images in Supabase dashboard');
  } else {
    console.log('⚠️  Setup completed with warnings');
    console.log('\n📋 Manual steps needed:');
    console.log(`   1. Visit Supabase Dashboard: ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_`);
    console.log('   2. Run migrations in SQL Editor (if not already done)');
    console.log('   3. Create storage bucket (if not already done)');
    console.log('   4. Re-run this script to verify');
  }
  console.log('='.repeat(50) + '\n');
}

main().catch(console.error);
