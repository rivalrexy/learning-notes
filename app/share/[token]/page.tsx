import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, getWeekRange, getYouTubeThumbnail } from "@/app/lib/utils";
import ReactMarkdown from "react-markdown";
import { Calendar, CalendarDays, Tag, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const note = await prisma.learningNote.findFirst({
    where: { shareToken: token, isPublic: true },
    include: {
      sources: { select: { id: true, title: true, type: true, url: true, author: true } },
      user: { select: { name: true } },
    },
  });

  if (!note) notFound();

  const dateLabel =
    note.type === "weekly" && note.weekNumber
      ? `Pekan ${note.weekNumber} · ${getWeekRange(note.weekNumber, note.year!)}`
      : formatDate(note.date);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-indigo-600 font-bold text-lg tracking-tight">
            BelajarKu
          </Link>
          <Link
            href="/register"
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            Buat akunmu
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Note card */}
        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Note header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              {note.type === "weekly"
                ? <CalendarDays className="w-3.5 h-3.5 text-purple-500" />
                : <Calendar className="w-3.5 h-3.5 text-blue-500" />}
              <span>{dateLabel}</span>
              <span className="text-gray-300">·</span>
              <span>oleh <strong className="text-gray-700">{note.user.name}</strong></span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {note.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Note content */}
          <div className="px-8 py-6">
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500 [&_blockquote]:italic [&_strong]:font-semibold [&_em]:italic [&_hr]:border-gray-200">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </div>

          {/* Sources */}
          {note.sources.length > 0 && (
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <BookOpen className="w-4 h-4" />
                Sumber Belajar
              </div>
              <div className="flex flex-wrap gap-3">
                {note.sources.map((s) => {
                  const thumbnail =
                    s.type === "youtube" && s.url ? getYouTubeThumbnail(s.url) : null;
                  const cover = s.type === "book" && s.url ? s.url : null;
                  const mediaUrl = thumbnail ?? cover;

                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-2 rounded-lg border overflow-hidden ${
                        s.type === "youtube"
                          ? "bg-red-50 border-red-100"
                          : s.type === "book"
                          ? "bg-amber-50 border-amber-100"
                          : "bg-blue-50 border-blue-100"
                      }`}
                    >
                      {mediaUrl && (
                        <img
                          src={mediaUrl}
                          alt=""
                          className="w-12 h-8 object-cover shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div className="py-1.5 pl-2 pr-3">
                        <p className={`text-xs font-medium ${
                          s.type === "youtube" ? "text-red-700"
                          : s.type === "book" ? "text-amber-700"
                          : "text-blue-700"
                        }`}>{s.title}</p>
                        {s.author && <p className="text-[10px] text-gray-400">{s.author}</p>}
                      </div>
                      {s.url && s.type !== "book" && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-2 text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Buat catatan belajarmu sendiri dengan BelajarKu
          </p>
          <Link
            href="/register"
            className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 text-sm"
          >
            Mulai gratis sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
