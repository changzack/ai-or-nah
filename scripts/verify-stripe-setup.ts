/**
 * Verify Stripe configuration
 * Run with: npx tsx scripts/verify-stripe-setup.ts
 */

import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
const priceSmall = process.env.STRIPE_PRICE_SMALL;
const priceMedium = process.env.STRIPE_PRICE_MEDIUM;
const priceLarge = process.env.STRIPE_PRICE_LARGE;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

console.log("🔍 Verifying Stripe Configuration...\n");

// Check environment variables
console.log("📋 Environment Variables:");
console.log(`✓ STRIPE_SECRET_KEY: ${secretKey ? secretKey.substring(0, 15) + "..." : "❌ NOT SET"}`);
console.log(`✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${publishableKey ? publishableKey.substring(0, 15) + "..." : "❌ NOT SET"}`);
console.log(`✓ STRIPE_WEBHOOK_SECRET: ${webhookSecret ? webhookSecret.substring(0, 15) + "..." : "❌ NOT SET"}`);
console.log(`✓ STRIPE_PRICE_SMALL: ${priceSmall || "❌ NOT SET"}`);
console.log(`✓ STRIPE_PRICE_MEDIUM: ${priceMedium || "❌ NOT SET"}`);
console.log(`✓ STRIPE_PRICE_LARGE: ${priceLarge || "❌ NOT SET"}`);
console.log();

// Check mode
if (secretKey) {
  const mode = secretKey.startsWith("sk_live_") ? "🟢 LIVE MODE" : "🟡 TEST MODE";
  console.log(`Mode: ${mode}\n`);
}

if (!secretKey) {
  console.error("❌ Cannot verify - STRIPE_SECRET_KEY not set");
  process.exit(1);
}

async function verifyStripeSetup() {
  const stripe = new Stripe(secretKey!, {
    apiVersion: "2025-12-15.clover",
  });

  // Test API connection
  try {
    console.log("🔌 Testing Stripe API connection...");
    const balance = await stripe.balance.retrieve();
    console.log("✅ Connected to Stripe successfully");
    console.log(`   Available: $${(balance.available[0]?.amount || 0) / 100}`);
    console.log(`   Pending: $${(balance.pending[0]?.amount || 0) / 100}\n`);
  } catch (error: any) {
    console.error("❌ Stripe API connection failed:", error.message);
    return;
  }

  // Verify prices
  console.log("💰 Verifying Price IDs...");
  const priceIds = [
    { name: "Small (5 credits - $2.99)", id: priceSmall, expectedAmount: 299 },
    { name: "Medium (15 credits - $6.99)", id: priceMedium, expectedAmount: 699 },
    { name: "Large (50 credits - $14.99)", id: priceLarge, expectedAmount: 1499 },
  ];

  for (const price of priceIds) {
    if (!price.id) {
      console.log(`❌ ${price.name}: NOT SET`);
      continue;
    }

    try {
      const priceObj = await stripe.prices.retrieve(price.id);
      const amount = priceObj.unit_amount || 0;
      const currency = priceObj.currency.toUpperCase();

      if (amount === price.expectedAmount) {
        console.log(`✅ ${price.name}: $${amount / 100} ${currency} (${price.id})`);
      } else {
        console.log(`⚠️  ${price.name}: Price mismatch - Expected $${price.expectedAmount / 100}, got $${amount / 100} ${currency}`);
      }
    } catch (error: any) {
      console.log(`❌ ${price.name}: Invalid price ID (${price.id})`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log("\n📊 Summary:");
  if (secretKey.startsWith("sk_live_")) {
    console.log("🟢 Using LIVE mode - real payments will be processed");
    console.log("⚠️  Make sure to test thoroughly before launching!");
  } else {
    console.log("🟡 Using TEST mode - no real payments");
    console.log("💡 Switch to live mode when ready for production");
  }
}

verifyStripeSetup();
