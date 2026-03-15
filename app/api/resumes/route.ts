import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_SECTIONS = [
  {
    type: "personal",
    order: 0,
    content: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
  },
  {
    type: "summary",
    order: 1,
    content: {
      text: "",
    },
  },
  {
    type: "experience",
    order: 2,
    content: {
      items: [] as Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
      }>,
    },
  },
  {
    type: "education",
    order: 3,
    content: {
      items: [] as Array<{
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
        gpa: string;
      }>,
    },
  },
  {
    type: "skills",
    order: 4,
    content: {
      items: [] as string[],
    },
  },
];

function getUserId(session: unknown): string | undefined {
  const s = session as { user?: { id?: string } } | null;
  return s?.user?.id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [resumes, subscription] = await Promise.all([
      prisma.resume.findMany({
        where: { userId },
        include: { sections: { orderBy: { order: "asc" } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        select: { plan: true, status: true },
      }),
    ]);

    return NextResponse.json({
      resumes,
      subscription: subscription ?? { plan: "free", status: "active" },
    });
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: "Untitled Resume",
        template: "modern",
        color: "#2563eb",
        sections: {
          create: DEFAULT_SECTIONS.map(({ type, order, content }) => ({
            type,
            order,
            content: content as object,
          })),
        },
      },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
