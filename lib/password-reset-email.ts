import { sendEmail, getDefaultFromAddress } from "@/lib/email";
import { formatPasswordResetExpiryLabel } from "@/lib/password-reset-config";
import { getEmailPreferencesUrl } from "@/lib/site-url";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Multiline mailing / legal block (set COMPANY_LEGAL_ADDRESS in production). */
function getLegalAddressText(): string {
  const raw = process.env.COMPANY_LEGAL_ADDRESS?.trim();
  if (raw) {
    return raw.replace(/\\n/g, "\n");
  }
  return ["OptimaCV (online service)", "https://optimacv.io/contact"].join("\n");
}

function legalAddressHtml(): string {
  const lines = getLegalAddressText().split(/\r?\n/).filter(Boolean);
  return lines.map((line) => escapeHtml(line)).join("<br>");
}

function buildPasswordResetHtml(
  resetUrl: string,
  expiryLabel: string,
  prefsUrl: string,
  supportEmail?: string
): string {
  const safeUrl = escapeHtml(resetUrl);
  const safeExpiry = escapeHtml(expiryLabel);
  const safePrefs = escapeHtml(prefsUrl);

  const supportBlock =
    supportEmail?.trim() ?
      `<p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.65;">
          Need help? Reply to this message or write to
          <a href="mailto:${escapeHtml(supportEmail.trim())}" style="color:#6d28d9;text-decoration:underline;">${escapeHtml(supportEmail.trim())}</a>.
        </p>`
    : `<p style="margin:20px 0 0;font-size:13px;color:#64748b;line-height:1.65;">Need help? Visit our website and open the contact form.</p>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>OptimaCV — password update</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:transparent;">
    Password update for your OptimaCV account. Link valid ${safeExpiry}. Not you? You can ignore this message.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;width:48px;">
                    <!-- Inline mark: works when remote images are blocked (no tracking pixels). -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:48px;height:48px;">
                      <tr>
                        <td align="center" valign="middle" bgcolor="#6d28d9" style="width:48px;height:48px;border-radius:12px;background-color:#6d28d9;color:#ffffff;font-size:13px;font-weight:700;line-height:1.2;font-family:Arial,sans-serif;">OC</td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">OptimaCV</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Resume tools</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 32px;">
              <h1 style="margin:0;font-size:21px;font-weight:600;color:#0f172a;line-height:1.35;">Password update request</h1>
              <p style="margin:16px 0 0;font-size:15px;color:#334155;line-height:1.65;">
                Someone requested a new password for your OptimaCV account. The secure link below is valid for
                <strong style="color:#0f172a;">${safeExpiry}</strong>. If you made this request, open the link on a device you trust.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
                <tr>
                  <td style="border-radius:10px;background-color:#6d28d9;">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Open secure link</a>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;font-size:13px;color:#64748b;line-height:1.65;">
                If the link does not open, copy this URL into your browser address bar:
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#475569;word-break:break-all;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${safeUrl}</p>
              ${supportBlock}
              <p style="margin:24px 0 0;padding-top:22px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;line-height:1.65;">
                You did not ask for this? No action is needed—your password is unchanged.
              </p>
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
                To help future messages reach your inbox, add
                <strong style="color:#64748b;">support@optimacv.io</strong> or
                <strong style="color:#64748b;">noreply@optimacv.io</strong> to your contacts.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:18px 20px;font-size:12px;color:#64748b;line-height:1.65;">
                    <p style="margin:0 0 10px;font-weight:600;color:#475569;">Email preferences</p>
                    <p style="margin:0 0 12px;">
                      <a href="${safePrefs}" style="color:#6d28d9;text-decoration:underline;">Manage email preferences</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.55;">
                      ${legalAddressHtml()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:#94a3b8;text-align:center;max-width:600px;line-height:1.5;">
          Transactional message · OptimaCV account security
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

function buildPasswordResetText(
  resetUrl: string,
  expiryLabel: string,
  prefsUrl: string,
  supportEmail?: string
): string {
  const support =
    supportEmail?.trim() ?
      `Questions? Email ${supportEmail.trim()}.\n\n`
    : "";

  return [
    "Hello,",
    "",
    "Someone requested a password update for your OptimaCV account.",
    "",
    `Use this secure link within ${expiryLabel}:`,
    resetUrl,
    "",
    support,
    "If you did not request this, you can ignore this message. Your password will not change.",
    "",
    `Email preferences: ${prefsUrl}`,
    "",
    "Add support@optimacv.io or noreply@optimacv.io to your contacts to improve delivery.",
    "",
    "Mailing / legal:",
    getLegalAddressText(),
    "",
    "— OptimaCV Support",
  ].join("\n");
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  options: { expiresInMs: number }
): Promise<void> {
  const expiryLabel = formatPasswordResetExpiryLabel(options.expiresInMs);
  const supportEmail = process.env.SUPPORT_EMAIL?.trim();
  const prefsUrl = getEmailPreferencesUrl();

  console.log("[password-reset] sendPasswordResetEmail called", {
    to,
    resetUrlPreview: resetUrl.slice(0, 80) + (resetUrl.length > 80 ? "…" : ""),
    from: getDefaultFromAddress(),
    expiryLabel,
  });

  const headers: Record<string, string> = {
    "List-Unsubscribe": `<${prefsUrl}>`,
    "Auto-Submitted": "auto-generated",
  };

  await sendEmail({
    to,
    subject: "OptimaCV — password update for your account",
    text: buildPasswordResetText(resetUrl, expiryLabel, prefsUrl, supportEmail),
    html: buildPasswordResetHtml(resetUrl, expiryLabel, prefsUrl, supportEmail),
    replyTo: supportEmail || "support@optimacv.io",
    headers,
  });
}
