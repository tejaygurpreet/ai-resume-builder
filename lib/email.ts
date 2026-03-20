import { Resend } from "resend";

let resendSingleton: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key?.trim()) {
    return null;
  }
  if (!resendSingleton) {
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Default "from" for Resend:
 * - Use RESEND_FROM when set (your verified domain).
 * - Fallback to onboarding@resend.dev so local/dev works without domain verification.
 *   (Resend allows sending to your own account email in dev; verify domain for production.)
 */
export function getDefaultFromAddress(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    "OptimaCV <onboarding@resend.dev>"
  );
}

/**
 * Send email via Resend. Checks API response — Resend does NOT throw on HTTP errors.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id: string | undefined }> {
  const resend = getResend();
  if (!resend) {
    const msg = "RESEND_API_KEY is not set — cannot send email.";
    console.error("[email]", msg);
    throw new Error(msg);
  }

  const from = getDefaultFromAddress();

  console.log("[email] send start", {
    to: params.to,
    subject: params.subject,
    from,
    hasReplyTo: !!params.replyTo,
  });

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });

    if (error) {
      const errMsg =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : JSON.stringify(error);
      console.error("[email] Resend returned error:", error);
      throw new Error(errMsg || "Resend rejected the email");
    }

    console.log("[email] send ok", { id: data?.id });
    return { id: data?.id };
  } catch (e) {
    console.error("[email] send exception:", e);
    throw e;
  }
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}
