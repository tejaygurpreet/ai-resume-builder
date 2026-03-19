import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MIN = 6;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }
    if (password.length < MIN) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN} characters` },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Request a new one." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("reset-password:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
