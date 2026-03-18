import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_SECTIONS = [
  {
    type: "personal",
    order: 0,
    content: {
      firstName: "",
      lastName: "",
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
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

    const [resumesRaw, subscription] = await Promise.all([
      prisma.resume.findMany({
        where: { userId },
        include: { sections: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        select: {
          plan: true,
          status: true,
          exportsUsed: true,
          exportsResetAt: true,
          oneTimeExport: true,
        },
      }),
    ]);

    let sub = subscription ?? {
      plan: "free" as const,
      status: "active" as const,
      exportsUsed: 0,
      exportsResetAt: new Date(),
      oneTimeExport: false,
    };

    const now = new Date();
    const resetAt = sub.exportsResetAt ? new Date(sub.exportsResetAt) : now;
    const isNewMonth =
      resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear();

    if (isNewMonth && subscription) {
      await prisma.subscription.update({
        where: { userId },
        data: { exportsUsed: 0, exportsResetAt: now },
      });
      sub = { ...sub, exportsUsed: 0, exportsResetAt: now };
    } else if (isNewMonth) {
      sub = { ...sub, exportsUsed: 0 };
    }

    // Fix "Untitled Resume" to sequential names (Resume 1, Resume 2, ...) by createdAt order
    const resumes = [...resumesRaw];
    const toFix = resumes.filter((r) => r.title === "Untitled Resume");
    if (toFix.length > 0) {
      for (let i = 0; i < resumes.length; i++) {
        const r = resumes[i];
        if (r.title === "Untitled Resume") {
          const newTitle = `Resume ${i + 1}`;
          await prisma.resume.update({
            where: { id: r.id },
            data: { title: newTitle },
          });
          (r as { title: string }).title = newTitle;
        }
      }
    }

    // Return ordered by updatedAt desc for dashboard display
    resumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      resumes,
      subscription: sub,
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

    const count = await prisma.resume.count({ where: { userId } });
    const title = `Resume ${count + 1}`;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
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
