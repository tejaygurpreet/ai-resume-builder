import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import { isEmailConfigured } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("[forgot-password] request for email:", email);

    if (!isEmailConfigured()) {
      console.error("[forgot-password] RESEND_API_KEY missing — email cannot be sent");
      return NextResponse.json(
        {
          error:
            "Password reset email is not configured on this server. Set RESEND_API_KEY (see .env.example).",
        },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("[forgot-password] no user found — returning generic success");
      return NextResponse.json({
        success: true,
        message: "If an account exists, we sent reset instructions.",
      });
    }

    console.log("[forgot-password] user found, id:", user.id);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    console.log("[forgot-password] token stored, expires:", expiresAt.toISOString());

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
    console.log("[forgot-password] reset URL base:", baseUrl);

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.error("[forgot-password] sendPasswordResetEmail failed:", e);
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? `Could not send email: ${e.message}`
              : "Could not send email. Try again later.",
        },
        { status: 503 }
      );
    }

    console.log("[forgot-password] email sent successfully for user:", user.id);

    return NextResponse.json({
      success: true,
      message: "If an account exists, we sent reset instructions.",
    });
  } catch (e) {
    console.error("[forgot-password] unexpected error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
