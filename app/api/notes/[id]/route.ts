import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownsNote(userId: string, noteId: string) {
  const note = await prisma.learningNote.findUnique({ where: { id: noteId } });
  return note?.userId === userId ? note : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await ownsNote(session.user.id, id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content, date, weekNumber, year, tags, sourceIds } = await req.json();

  const updated = await prisma.learningNote.update({
    where: { id },
    data: {
      title,
      content,
      date,
      weekNumber: weekNumber ?? null,
      year: year ?? null,
      tags: tags ?? [],
      sources: {
        set: sourceIds?.map((sid: string) => ({ id: sid })) ?? [],
      },
    },
    include: { sources: { select: { id: true, title: true, type: true, url: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await ownsNote(session.user.id, id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.learningNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
