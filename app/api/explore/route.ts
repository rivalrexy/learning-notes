import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? undefined;
  const search = req.nextUrl.searchParams.get("search") ?? undefined;

  const notes = await prisma.learningNote.findMany({
    where: {
      isPublic: true,
      ...(userId ? { userId } : {}),
      ...(search
        ? {
            OR: [
              { title:   { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      sources: { select: { id: true, title: true, type: true, url: true } },
      user:    { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(notes);
}
