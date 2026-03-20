import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured } from "@/lib/email";

const DEFAULT_CONTACT_INBOX = "tejaygurpreett@icloud.com";
const DEFAULT_CONTACT_FROM = "OptimaCV Contact <support@optimacv.io>";

const MAX_NAME = 200;
const MAX_MESSAGE = 10_000;

function getContactInbox(): string {
  // Contact form only — do not fall back to SUPPORT_EMAIL so it isn’t routed to support@ by mistake.
  return process.env.CONTACT_FORM_TO?.trim() || DEFAULT_CONTACT_INBOX;
}

function getContactFromAddress(): string {
  return process.env.CONTACT_FROM?.trim() || DEFAULT_CONTACT_FROM;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeSubjectFragment(s: string): string {
  return s.replace(/[\r\n\u0000]/g, " ").trim().slice(0, 120);
}

function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildStaffEmailHtml(name: string, email: string, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr><td>
      <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px 24px 8px;">
          <p style="margin:0;font-size:18px;font-weight:700;">New contact form submission</p>
          <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Reply goes to the visitor (Reply-To is set).</p>
        </td></tr>
        <tr><td style="padding:8px 24px 24px;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 12px;"><strong>Name</strong><br>${escapeHtml(name)}</p>
          <p style="margin:0 0 12px;"><strong>Email</strong><br><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p style="margin:0 0 8px;"><strong>Message</strong></p>
          <p style="margin:0;white-space:pre-wrap;color:#334155;">${escapeHtml(message)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();
}

function buildStaffEmailText(name: string, email: string, message: string): string {
  return [
    "New contact form submission",
    "---------------------------",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
    "",
    "Reply to this email to respond directly to the visitor (Reply-To is set).",
  ].join("\n");
}

function buildAutoresponseHtml(visitorName: string): string {
  const first = visitorName.trim().split(/\s+/)[0] || "there";
  const safe = escapeHtml(first);
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr><td>
      <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">
        <tr><td style="padding:28px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">Thanks for reaching out</p>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#334155;">Hi ${safe},</p>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#334155;">
            We received your message and will reply within <strong>24 hours</strong> where possible.
          </p>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#334155;">
            — OptimaCV Support
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();
}

function buildAutoresponseText(visitorName: string): string {
  const first = visitorName.trim().split(/\s+/)[0] || "there";
  return [
    `Hi ${first},`,
    "",
    "We received your message and will reply within 24 hours where possible.",
    "",
    "— OptimaCV Support",
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { name: rawName, email: rawEmail, message: rawMessage } = body as Record<string, unknown>;

    const name = typeof rawName === "string" ? rawName.trim() : "";
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, email, and message." },
        { status: 400 }
      );
    }

    if (name.length > MAX_NAME) {
      return NextResponse.json({ error: "Name is too long." }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!isEmailConfigured()) {
      console.error("[contact] RESEND_API_KEY not set");
      return NextResponse.json(
        { error: "We can’t send messages right now. Please try again later or email us directly." },
        { status: 503 }
      );
    }

    const to = getContactInbox();
    const from = getContactFromAddress();
    const subject = `New Contact Message from ${sanitizeSubjectFragment(name)}`;

    console.log("[contact] notify inbox:", to, "visitor:", email);

    const { id: staffId } = await sendEmail({
      from,
      to,
      subject,
      replyTo: email,
      html: buildStaffEmailHtml(name, email, message),
      text: buildStaffEmailText(name, email, message),
    });

    try {
      await sendEmail({
        from,
        to: email,
        subject: "We received your message — OptimaCV",
        html: buildAutoresponseHtml(name),
        text: buildAutoresponseText(name),
      });
    } catch (autoErr) {
      console.error("[contact] autoresponse failed (staff email was sent):", autoErr);
    }

    return NextResponse.json({
      success: true,
      id: staffId,
      message: "Your message was sent. Check your inbox for a confirmation email.",
    });
  } catch (error) {
    console.error("[contact] error:", error);
    const msg =
      error instanceof Error && error.message ?
        error.message
      : "Something went wrong while sending your message.";
    return NextResponse.json(
      { error: msg.length > 200 ? "Could not send your message. Please try again." : msg },
      { status: 500 }
    );
  }
}
