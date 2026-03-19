import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isValidPhoneDigits, normalizePhoneDigits } from "@/lib/phone";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const phoneRaw = typeof phone === "string" ? phone.trim() : "";
    if (!phoneRaw) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }
    const phoneNormalized = normalizePhoneDigits(phoneRaw);
    if (!isValidPhoneDigits(phoneNormalized)) {
      return NextResponse.json(
        { error: "Enter a valid phone number (at least 10 digits)" },
        { status: 400 }
      );
    }

    const phoneTaken = await prisma.user.findFirst({
      where: { phoneNormalized },
    });
    if (phoneTaken) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: trimmedEmail,
          password: hashedPassword,
          name: typeof name === "string" ? name.trim() || null : null,
          phone: phoneRaw,
          phoneNormalized,
        },
      });

      await tx.subscription.create({
        data: {
          userId: newUser.id,
          plan: "free",
          status: "active",
        },
      });

      return newUser;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
