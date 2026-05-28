import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, isPublic } = (await req.json()) as { type: string; isPublic: boolean };

  const notes = await prisma.learningNote.findMany({
    where: { userId: session.user.id, type },
    select: { id: true, shareToken: true },
  });

  await prisma.$transaction(
    notes.map((n) =>
      prisma.learningNote.update({
        where: { id: n.id },
        data: { isPublic, shareToken: n.shareToken ?? randomUUID().replace(/-/g, "") },
      })
    )
  );

  return NextResponse.json({ updated: notes.length });
}
