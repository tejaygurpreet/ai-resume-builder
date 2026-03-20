import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured, getDefaultFromAddress } from "@/lib/email";

/**
 * POST /api/test-email
 * Body: { "to": "you@example.com" } (optional — defaults to first recipient in env)
 *
 * Security: requires header x-test-email-secret matching TEST_EMAIL_SECRET (or only works in development).
 */
export async function POST(req: Request) {
  const secret = req.headers.get("x-test-email-secret");
  const expected = process.env.TEST_EMAIL_SECRET;
  const allowed =
    process.env.NODE_ENV !== "production" ||
    (expected && secret === expected);

  if (!allowed) {
    console.warn("[test-email] blocked — set TEST_EMAIL_SECRET and send x-test-email-secret header in production");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set", configured: false },
      { status: 503 }
    );
  }

  let to: string;
  try {
    const body = await req.json().catch(() => ({}));
    to =
      typeof body.to === "string" && body.to.includes("@")
        ? body.to.trim()
        : process.env.TEST_EMAIL_TO || process.env.SUPPORT_EMAIL || "";
  } catch {
    to = process.env.TEST_EMAIL_TO || process.env.SUPPORT_EMAIL || "";
  }

  if (!to) {
    return NextResponse.json(
      {
        error:
          'Provide { "to": "your@email.com" } in JSON body, or set TEST_EMAIL_TO / SUPPORT_EMAIL in .env',
      },
      { status: 400 }
    );
  }

  console.log("[test-email] sending to:", to, "from:", getDefaultFromAddress());

  try {
    const { id } = await sendEmail({
      to,
      subject: "OptimaCV — test email",
      html: "<p>If you received this, Resend is working.</p>",
    });
    return NextResponse.json({ success: true, id, to, from: getDefaultFromAddress() });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[test-email] failed:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
