import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
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

    const phoneDigits = normalizePhoneDigits(phoneRaw);
    if (!isValidPhoneDigits(phoneDigits)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid phone number with 10–15 digits (country code optional)",
        },
        { status: 400 }
      );
    }

    const phoneTaken = await prisma.user.findUnique({
      where: { phone: phoneDigits },
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
          phone: phoneDigits,
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
        phone: user.phone,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target;
        const fields = Array.isArray(target)
          ? target.map(String)
          : target != null
            ? [String(target)]
            : [];
        const isPhone = fields.some((f) => f.includes("phone"));
        const isEmail = fields.some((f) => f.includes("email"));
        if (isPhone) {
          return NextResponse.json(
            { error: "An account with this phone number already exists" },
            { status: 409 }
          );
        }
        if (isEmail) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "This email or phone is already registered" },
          { status: 409 }
        );
      }
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
