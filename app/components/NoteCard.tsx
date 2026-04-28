"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { formatDate, getYouTubeThumbnail } from "@/app/lib/utils";
import {
  Calendar, Tag, Trash2, Pencil,
  Play, BookOpen, FileText, HelpCircle, Eye,
} from "lucide-react";
import ShareButton from "@/app/components/ShareButton";
import NotePreviewModal from "@/app/components/NotePreviewModal";

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
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

const srcPill: Record<string, string> = {
  youtube: "bg-red-100 text-red-600",
  book:    "bg-amber-100 text-amber-700",
  article: "bg-blue-100 text-blue-600",
  other:   "bg-gray-100 text-gray-500",
};

function SrcPillIcon({ type }: { type: string }) {
  const cls = "w-3 h-3 shrink-0";
  if (type === "youtube")  return <Play     className={cls} />;
  if (type === "book")     return <BookOpen className={cls} />;
  if (type === "article")  return <FileText className={cls} />;
  return <HelpCircle className={cls} />;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  const barCls = note.type === "daily"
    ? "bg-gradient-to-r from-blue-400 to-indigo-500"
    : "bg-gradient-to-r from-purple-400 to-violet-500";

  const handleDelete = () => {
    setShowPreview(false);
    onDelete?.(note.id);
  };

  return (
    <>
      <div
        onClick={() => setShowPreview(true)}
        className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer flex flex-col"
      >
        {/* Type colour bar */}
        <div className={`h-1 w-full shrink-0 ${barCls}`} />

        <div className="p-5 flex flex-col flex-1 gap-3">

          {/* Title + actions row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-[15px] leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                {note.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(note.date)}
                </div>
                {note.type === "weekly" && note.weekNumber && (
                  <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                    Pekan {note.weekNumber}
                  </span>
                )}
                {note.user && (
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 bg-indigo-100 rounded-full flex items-center justify-center text-[8px] font-bold text-indigo-600">
                      {note.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{note.user.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons — stop click from bubbling to card */}
            {(onEdit || onDelete) && (
              <div className="flex gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <ShareButton
                  noteId={note.id}
                  initialIsPublic={note.isPublic ?? false}
                  initialToken={note.shareToken ?? null}
                />
                {onEdit && (
                  <button
                    onClick={() => onEdit(note)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(note.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content preview with gradient fade */}
          <div className="relative overflow-hidden" style={{ maxHeight: "4.5rem" }}>
            <div className="text-sm text-gray-500 leading-relaxed [&_p]:m-0 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:leading-normal [&_strong]:font-semibold [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-gray-200 [&_blockquote]:pl-2 [&_blockquote]:text-gray-400">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="flex items-center gap-0.5 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  <Tag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
              {note.tags.length > 4 && (
                <span className="text-xs text-gray-400 self-center">+{note.tags.length - 4}</span>
              )}
            </div>
          )}

          {/* Sources — distinct pills per source type */}
          {note.sources.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {note.sources.map((s) => {
                  const thumbnail = s.type === "youtube" && s.url ? getYouTubeThumbnail(s.url) : null;
                  const cover     = s.type === "book"    && s.url ? s.url : null;
                  const thumb     = thumbnail ?? cover;

                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border border-white/60 shadow-sm ${srcPill[s.type] ?? srcPill.other}`}
                    >
                      {thumb ? (
                        <img
                          src={thumb} alt=""
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <SrcPillIcon type={s.type} />
                      )}
                      <span className="max-w-[8rem] truncate">{s.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preview hint */}
          <div className="flex items-center gap-1 text-xs text-gray-300 group-hover:text-indigo-400 transition-colors mt-auto pt-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Klik untuk lihat detail</span>
          </div>
        </div>
      </div>

      {showPreview && (
        <NotePreviewModal
          note={note}
          showActions={!!(onEdit || onDelete)}
          onEdit={onEdit ? () => { setShowPreview(false); onEdit(note); } : undefined}
          onDelete={onDelete ? handleDelete : undefined}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
