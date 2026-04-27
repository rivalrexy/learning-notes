import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await prisma.learningNote.findUnique({ where: { id } });

  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newIsPublic = !note.isPublic;
  // Generate token once, keep it across toggle cycles so the link stays the same
  const shareToken = note.shareToken ?? randomUUID().replace(/-/g, "");

  const updated = await prisma.learningNote.update({
    where: { id },
    data: { isPublic: newIsPublic, shareToken },
  });

  return NextResponse.json({ isPublic: updated.isPublic, shareToken: updated.shareToken });
}
