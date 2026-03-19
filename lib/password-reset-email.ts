import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    console.warn("[password-reset] RESEND_API_KEY not set; email not sent.");
    throw new Error("Email is not configured.");
  }
  const from =
    process.env.RESEND_FROM ?? "OptimaCV <support@optimacv.io>";
  await resend.emails.send({
    from,
    to,
    subject: "Reset your OptimaCV password",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Password reset</h2>
        <p style="color: #444; line-height: 1.5;">Click the button below to choose a new password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">Reset password</a>
        </p>
        <p style="color: #64748b; font-size: 13px;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}
