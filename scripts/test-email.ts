/**
 * Test script for Resend email delivery
 * Run with: npx tsx scripts/test-email.ts your-email@example.com
 */

import { Resend } from "resend";

const email = process.argv[2];
const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@aiornah.xyz";

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: npx tsx scripts/test-email.ts your-email@example.com");
  process.exit(1);
}

if (!apiKey) {
  console.error("❌ RESEND_API_KEY not set in environment");
  process.exit(1);
}

async function testEmail() {
  console.log("🧪 Testing Resend email delivery...\n");
  console.log(`From: ${fromEmail}`);
  console.log(`To: ${email}`);
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log();

  const resend = new Resend(apiKey);

  try {
    console.log("📧 Sending test email...");
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Test Email from AI or Nah",
      html: `
        <h1>Test Email</h1>
        <p>If you received this, email sending is working correctly!</p>
        <p>Test verification code: <strong>123456</strong></p>
      `,
      text: "Test Email\n\nIf you received this, email sending is working correctly!\n\nTest verification code: 123456",
    });

    console.log("✅ Email sent successfully!");
    console.log("📨 Result:", JSON.stringify(result, null, 2));
    console.log("\n✨ Check your inbox (and spam folder)!");
  } catch (error: any) {
    console.error("❌ Email send failed:");
    console.error(error);

    if (error.message?.includes("domain")) {
      console.log("\n💡 Domain not verified. Steps to fix:");
      console.log("   1. Go to https://resend.com/domains");
      console.log("   2. Add your domain: aiornah.xyz");
      console.log("   3. Add the DNS records they provide");
      console.log("   4. Wait for verification");
    } else if (error.message?.includes("sandbox")) {
      console.log("\n💡 Sandbox mode restrictions:");
      console.log("   - Free tier only sends to verified email addresses");
      console.log("   - Verify your domain to send to any email");
    }
  }
}

testEmail();
