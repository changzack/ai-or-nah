/**
 * Display migrations for copy-paste into Supabase SQL Editor
 *
 * Usage: npx tsx scripts/show-migrations.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

function printBoxed(title: string, content: string) {
  const width = 70;
  const line = '='.repeat(width);

  console.log('\n' + line);
  console.log(`  ${title}`);
  console.log(line);
  console.log(content);
  console.log(line + '\n');
}

async function main() {
  console.log('\n🗄️  Supabase Database Migrations\n');
  console.log('📋 Instructions:');
  console.log('   1. Open Supabase SQL Editor: https://app.myzguodpqjlwndpgdcpw.supabase.co/project/_/sql');
  console.log('   2. Click "New Query"');
  console.log('   3. Copy the SQL below and paste it');
  console.log('   4. Click "Run" button');
  console.log('   5. Repeat for both migrations\n');

  // Read migration files
  const migration1 = readFileSync(
    join(process.cwd(), 'supabase/migrations/001_init.sql'),
    'utf-8'
  );
  const migration2 = readFileSync(
    join(process.cwd(), 'supabase/migrations/002_functions.sql'),
    'utf-8'
  );

  printBoxed('MIGRATION 1: 001_init.sql (Tables & Indexes)', migration1);

  console.log('👆 Copy everything between the lines above\n');
  console.log('Press Enter when you\'ve run Migration 1...');

  // Wait for user input
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });

  printBoxed('MIGRATION 2: 002_functions.sql (Functions)', migration2);

  console.log('👆 Copy everything between the lines above\n');
  console.log('✅ After running both migrations, close this script (Ctrl+C)');
  console.log('   Then run: npx tsx scripts/setup-supabase.ts\n');
}

main().catch(console.error);
