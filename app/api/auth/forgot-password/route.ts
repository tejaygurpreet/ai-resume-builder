import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, we sent reset instructions.",
      });
    }

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

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.error("sendPasswordResetEmail:", e);
      return NextResponse.json(
        { error: "Could not send email. Try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, we sent reset instructions.",
    });
  } catch (e) {
    console.error("forgot-password:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
