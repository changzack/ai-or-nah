/**
 * Email templates for verification codes
 */

export function getVerificationCodeEmail(code: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Your AI or Nah verification code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #FF6B6B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI or Nah</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">Check if your IG crush is real</p>
          </div>

          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Your Verification Code</h2>
            <p style="color: #6b7280; font-size: 16px;">Use this code to access your AI or Nah credits:</p>

            <div style="background: #fdf6e9; border: 2px solid #8B5CF6; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 40px; font-weight: bold; color: #8B5CF6; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              <strong>This code expires in 10 minutes.</strong>
            </p>

            <p style="color: #9ca3af; font-size: 13px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>AI or Nah &bull; Entertainment purposes only</p>
          </div>
        </body>
      </html>
    `,
    text: `
AI or Nah - Verification Code

Your verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, you can safely ignore this email.

---
AI or Nah
Check if your IG crush is real
Entertainment purposes only
    `.trim(),
  };
}
