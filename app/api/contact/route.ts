import { NextResponse } from "next/server";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!isEmailConfigured()) {
      console.error("[contact] RESEND_API_KEY not set");
      return NextResponse.json({ error: "Email is not configured." }, { status: 503 });
    }

    const to = process.env.SUPPORT_EMAIL;
    if (!to) {
      console.error("[contact] SUPPORT_EMAIL not set");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    console.log("[contact] sending from visitor:", email);

    const { id } = await sendEmail({
      to,
      subject: "New Contact Message",
      replyTo: email,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(String(name))}</p>
        <p><strong>Email:</strong> ${escapeHtml(String(email))}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(String(message))}</p>
      `,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[contact] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
