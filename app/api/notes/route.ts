import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type");

  const notes = await prisma.learningNote.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
    },
    include: { sources: { select: { id: true, title: true, type: true, url: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, type, date, weekNumber, year, tags, category, sourceIds } = await req.json();

  if (!title || !content || !type || !date) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const note = await prisma.learningNote.create({
    data: {
      title,
      content,
      type,
      date,
      weekNumber: weekNumber ?? null,
      year: year ?? null,
      tags: tags ?? [],
      category: category ?? "Lainnya",
      userId: session.user.id,
      sources: sourceIds?.length
        ? { connect: sourceIds.map((id: string) => ({ id })) }
        : undefined,
    },
    include: { sources: { select: { id: true, title: true, type: true, url: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
