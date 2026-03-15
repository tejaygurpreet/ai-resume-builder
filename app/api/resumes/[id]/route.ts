import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { id: string };
}

function getUserId(session: unknown): string | undefined {
  const s = session as { user?: { id?: string } } | null;
  return s?.user?.id;
}

async function verifyOwnership(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { userId: true },
  });
  if (!resume) return "not_found" as const;
  if (resume.userId !== userId) return "forbidden" as const;
  return "ok" as const;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, userId);
    if (ownership === "not_found") {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    if (ownership === "forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
      include: { sections: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error(`GET /api/resumes/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, userId);
    if (ownership === "not_found") {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    if (ownership === "forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, template, color, sections } = body as {
      title?: string;
      template?: string;
      color?: string;
      sections?: Array<{
        id?: string;
        type: string;
        order: number;
        content: object;
      }>;
    };

    const resume = await prisma.$transaction(async (tx) => {
      await tx.resume.update({
        where: { id: params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(template !== undefined && { template }),
          ...(color !== undefined && { color }),
        },
      });

      if (sections) {
        const existingSections = await tx.section.findMany({
          where: { resumeId: params.id },
          select: { id: true },
        });
        const existingIds = new Set(existingSections.map((s) => s.id));
        const incomingIds = new Set(
          sections.filter((s) => s.id).map((s) => s.id!)
        );

        const toDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));
        if (toDelete.length > 0) {
          await tx.section.deleteMany({
            where: { id: { in: toDelete }, resumeId: params.id },
          });
        }

        for (const section of sections) {
          if (section.id && existingIds.has(section.id)) {
            await tx.section.update({
              where: { id: section.id },
              data: {
                type: section.type,
                order: section.order,
                content: section.content,
              },
            });
          } else {
            await tx.section.create({
              data: {
                resumeId: params.id,
                type: section.type,
                order: section.order,
                content: section.content,
              },
            });
          }
        }
      }

      return tx.resume.findUnique({
        where: { id: params.id },
        include: { sections: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error(`PUT /api/resumes/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownership = await verifyOwnership(params.id, userId);
    if (ownership === "not_found") {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    if (ownership === "forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.resume.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/resumes/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
