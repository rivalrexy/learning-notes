import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? undefined;
  const search = req.nextUrl.searchParams.get("search") ?? undefined;

  try {
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
  } catch (err) {
    console.error("[explore] DB error:", err);
    return NextResponse.json({ error: "Gagal memuat catatan" }, { status: 500 });
  }
}
