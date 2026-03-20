import { sendEmail, getDefaultFromAddress } from "@/lib/email";
import { formatPasswordResetExpiryLabel } from "@/lib/password-reset-config";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPasswordResetHtml(resetUrl: string, expiryLabel: string, supportEmail?: string): string {
  const safeUrl = escapeHtml(resetUrl);
  const safeExpiry = escapeHtml(expiryLabel);
  const support =
    supportEmail?.trim() ?
      `<p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Questions? Reply to this message or write to <a href="mailto:${escapeHtml(supportEmail.trim())}" style="color:#7c3aed;text-decoration:none;">${escapeHtml(supportEmail.trim())}</a>.</p>`
    : `<p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.5;">If you need help, contact us through the website.</p>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OptimaCV — password reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <!-- Preheader (hidden preview text for inbox clients) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Use the link below to set a new OptimaCV password. Link valid for ${safeExpiry}.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">OptimaCV</p>
              <p style="margin:8px 0 0;font-size:14px;color:#64748b;">Resume builder</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#0f172a;line-height:1.3;">Set a new password</h1>
              <p style="margin:14px 0 0;font-size:15px;color:#334155;line-height:1.6;">
                We received a request to update the password for your OptimaCV account. Use the button below to continue. This link remains valid for <strong style="color:#0f172a;">${safeExpiry}</strong>.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#7c3aed,#6d28d9);">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Continue to OptimaCV</a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                If the button does not work, copy and paste this address into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#475569;word-break:break-all;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${safeUrl}</p>
              ${support}
              <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e2e8f0;font-size:13px;color:#94a3b8;line-height:1.5;">
                If you did not ask for this, you can ignore this email. Your password will stay the same.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;max-width:560px;line-height:1.5;">
          OptimaCV · Account notification
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

function buildPasswordResetText(resetUrl: string, expiryLabel: string, supportEmail?: string): string {
  const support =
    supportEmail?.trim() ?
      `Questions? Email ${supportEmail.trim()}.\n\n`
    : "";

  return [
    "Hello,",
    "",
    "We received a request to update the password for your OptimaCV account.",
    "",
    `Open this link in your browser (valid for ${expiryLabel}):`,
    resetUrl,
    "",
    support,
    "If you did not request this, you can ignore this message.",
    "",
    "— OptimaCV",
  ].join("\n");
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  options: { expiresInMs: number }
): Promise<void> {
  const expiryLabel = formatPasswordResetExpiryLabel(options.expiresInMs);
  const supportEmail = process.env.SUPPORT_EMAIL?.trim();

  console.log("[password-reset] sendPasswordResetEmail called", {
    to,
    resetUrlPreview: resetUrl.slice(0, 80) + (resetUrl.length > 80 ? "…" : ""),
    from: getDefaultFromAddress(),
    expiryLabel,
  });

  await sendEmail({
    to,
    subject: "OptimaCV — confirm your password update",
    text: buildPasswordResetText(resetUrl, expiryLabel, supportEmail),
    html: buildPasswordResetHtml(resetUrl, expiryLabel, supportEmail),
  });
}
