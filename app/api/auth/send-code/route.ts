import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateOrigin, createCsrfError } from "@/lib/auth/csrf";
import { checkSendRateLimit, createVerificationCode } from "@/lib/auth/verification";
import { getVerificationCodeEmail } from "@/lib/email/templates";

/**
 * Send verification code endpoint
 * POST /api/auth/send-code
 * Body: { "email": "user@example.com" }
 */
export async function POST(request: Request) {
  // CSRF validation
  if (!validateOrigin(request)) {
    return createCsrfError();
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_email",
          message: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = await checkSendRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: "error",
          error: "rate_limited",
          message: "Too many verification codes sent. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // Create verification code
    const code = await createVerificationCode(email);
    if (!code) {
      return NextResponse.json(
        {
          status: "error",
          error: "code_creation_failed",
          message: "Failed to create verification code. Please try again.",
        },
        { status: 500 }
      );
    }

    // Send email
    const emailContent = getVerificationCodeEmail(code);

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@aiornah.xyz";

      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error("[send-code] Error sending email:", emailError);
      console.error("[send-code] Email error details:", JSON.stringify(emailError, null, 2));
      return NextResponse.json(
        {
          status: "error",
          error: "email_send_failed",
          message: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("[send-code] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "internal_error",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
