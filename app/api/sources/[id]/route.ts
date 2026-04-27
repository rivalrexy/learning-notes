import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownsSource(userId: string, sourceId: string) {
  const source = await prisma.learningSource.findUnique({ where: { id: sourceId } });
  return source?.userId === userId ? source : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await ownsSource(session.user.id, id);
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { type, title, author, url, description } = await req.json();

  const updated = await prisma.learningSource.update({
    where: { id },
    data: {
      type,
      title,
      author: author || null,
      url: url || null,
      description: description || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const source = await ownsSource(session.user.id, id);
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.learningSource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
