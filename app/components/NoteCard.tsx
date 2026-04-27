"use client";

import ReactMarkdown from "react-markdown";
import { formatDate } from "@/app/lib/utils";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { Calendar, Tag, BookOpen, Trash2, Pencil, ExternalLink } from "lucide-react";
import ShareButton from "@/app/components/ShareButton";

interface NoteSource { id: string; title: string; type: string; url?: string; }
interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; tags: string[];
  sources: NoteSource[];
  isPublic?: boolean;
  shareToken?: string | null;
}

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">{note.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(note.date)}</span>
            {note.type === "weekly" && note.weekNumber && (
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                Pekan {note.weekNumber}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <ShareButton
            noteId={note.id}
            initialIsPublic={note.isPublic ?? false}
            initialToken={note.shareToken ?? null}
          />
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Markdown content preview */}
      <div
        className="mt-3 overflow-hidden text-sm text-gray-600"
        style={{ maxHeight: "4.5rem" }}
      >
        <div className="[&_p]:m-0 [&_h1]:text-base [&_h1]:font-bold [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:leading-normal [&_strong]:font-semibold [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-gray-200 [&_blockquote]:pl-2 [&_blockquote]:text-gray-500">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      )}

      {/* Sources with thumbnails */}
      {note.sources.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-medium">Sumber belajar</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.sources.map((s) => {
              const thumbnail =
                s.type === "youtube" && s.url ? getYouTubeThumbnail(s.url) : null;
              const cover = s.type === "book" && s.url ? s.url : null;
              const mediaUrl = thumbnail ?? cover;
              const hasLink = s.type !== "book" && s.url;

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 rounded-lg border border-gray-100 overflow-hidden ${
                    s.type === "youtube"
                      ? "bg-red-50"
                      : s.type === "book"
                      ? "bg-amber-50"
                      : "bg-blue-50"
                  }`}
                >
                  {mediaUrl && (
                    <img
                      src={mediaUrl}
                      alt=""
                      className="w-10 h-7 object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 ${
                    s.type === "youtube"
                      ? "text-red-700"
                      : s.type === "book"
                      ? "text-amber-700"
                      : "text-blue-700"
                  }`}>
                    {s.title}
                  </span>
                  {hasLink && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mr-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
