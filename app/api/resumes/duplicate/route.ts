import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId } = body as { resumeId?: string };

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required" },
        { status: 400 }
      );
    }

    const original = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: { sections: true },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.resume.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        template: original.template,
        color: original.color,
        sections: {
          create: original.sections.map((s) => ({
            type: s.type,
            order: s.order,
            content: s.content as any,
          })),
        },
      },
      include: { sections: true },
    });

    return NextResponse.json({ resume: duplicate });
  } catch (err) {
    console.error("Duplicate resume error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Duplication failed" },
      { status: 500 }
    );
  }
}
