"use client";

import ReactMarkdown from "react-markdown";
import { formatDate, getYouTubeThumbnail } from "@/app/lib/utils";
import {
  X, Calendar, Tag, BookOpen, Pencil, Trash2,
  ExternalLink, Play, FileText, HelpCircle, User,
} from "lucide-react";
import ShareButton from "@/app/components/ShareButton";

interface NoteSource { id: string; title: string; type: string; url?: string | null; }
interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; sources: NoteSource[];
  isPublic?: boolean; shareToken?: string | null;
  user?: { id: string; name: string };
}

interface Props {
  note: Note;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const srcTypeLabel: Record<string, string> = {
  youtube: "YouTube", book: "Buku", article: "Artikel", other: "Lainnya",
};

const srcColors: Record<string, { wrap: string; icon: string; label: string; link: string }> = {
  youtube: {
    wrap:  "bg-red-50 border-red-100",
    icon:  "bg-red-100",
    label: "text-red-800",
    link:  "text-red-400 hover:text-red-600 hover:bg-red-100",
  },
  book: {
    wrap:  "bg-amber-50 border-amber-100",
    icon:  "bg-amber-100",
    label: "text-amber-800",
    link:  "text-amber-400 hover:text-amber-600 hover:bg-amber-100",
  },
  article: {
    wrap:  "bg-blue-50 border-blue-100",
    icon:  "bg-blue-100",
    label: "text-blue-800",
    link:  "text-blue-400 hover:text-blue-600 hover:bg-blue-100",
  },
  other: {
    wrap:  "bg-gray-50 border-gray-100",
    icon:  "bg-gray-100",
    label: "text-gray-800",
    link:  "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
  },
};

function SrcIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  if (type === "youtube")  return <Play     className={`${cls} text-red-500`} />;
  if (type === "book")     return <BookOpen className={`${cls} text-amber-500`} />;
  if (type === "article")  return <FileText className={`${cls} text-blue-500`} />;
  return <HelpCircle className={`${cls} text-gray-400`} />;
}

export default function NotePreviewModal({ note, showActions, onEdit, onDelete, onClose }: Props) {
  const c = note.type === "daily"
    ? { badge: "bg-blue-100 text-blue-700", bar: "from-blue-400 to-indigo-500" }
    : { badge: "bg-purple-100 text-purple-700", bar: "from-purple-400 to-violet-500" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Colour bar */}
        <div className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r shrink-0 ${c.bar}`} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-gray-100 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.badge}`}>
                {note.type === "daily" ? "Harian" : "Mingguan"}
              </span>
              {note.weekNumber && (
                <span className="text-xs text-gray-500 font-medium">Pekan {note.weekNumber}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{note.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{formatDate(note.date)}</span>
              </div>
              {note.user && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                    {note.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{note.user.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {showActions && (
              <>
                <ShareButton
                  noteId={note.id}
                  initialIsPublic={note.isPublic ?? false}
                  initialToken={note.shareToken ?? null}
                />
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit catatan"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Markdown content */}
          <div className="
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2
            [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-3 [&_h2]:mb-2
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-2 [&_h3]:mb-1
            [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-gray-700
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
            [&_li]:my-1 [&_li]:leading-relaxed [&_li]:text-gray-700
            [&_strong]:font-semibold [&_strong]:text-gray-900
            [&_em]:italic [&_em]:text-gray-700
            [&_code]:bg-indigo-50 [&_code]:text-indigo-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.8em] [&_code]:font-mono
            [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre]:text-sm
            [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0
            [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:bg-indigo-50/40 [&_blockquote]:rounded-r-lg [&_blockquote]:text-gray-600 [&_blockquote]:italic
            [&_hr]:border-gray-200 [&_hr]:my-4
            [&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-indigo-800
            [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
          ">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  <Tag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
            </div>
          )}

          {/* Sources */}
          {note.sources.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
                <BookOpen className="w-4 h-4" />
                Sumber Belajar
                <span className="ml-1 bg-gray-100 text-gray-500 text-xs font-medium px-1.5 py-0.5 rounded-full">
                  {note.sources.length}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {note.sources.map((s) => {
                  const col = srcColors[s.type] ?? srcColors.other;
                  const thumbnail = s.type === "youtube" && s.url ? getYouTubeThumbnail(s.url) : null;
                  const cover     = s.type === "book"    && s.url ? s.url : null;
                  const media     = thumbnail ?? cover;

                  return (
                    <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${col.wrap}`}>
                      {media ? (
                        <img
                          src={media} alt=""
                          className="w-14 h-10 object-cover rounded-lg shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${col.icon}`}>
                          <SrcIcon type={s.type} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${col.label}`}>{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{srcTypeLabel[s.type] ?? s.type}</p>
                      </div>
                      {s.url && s.type !== "book" && (
                        <a
                          href={s.url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`shrink-0 p-1.5 rounded-lg transition-colors ${col.link}`}
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

          {/* Author info (explore context) */}
          {note.user && !showActions && (
            <div className="border-t border-gray-100 pt-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                {note.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-gray-700">{note.user.name}</span>
                <span className="ml-1 text-gray-400">— pemilik catatan ini</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
