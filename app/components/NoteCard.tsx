"use client";

import { formatDate } from "@/app/lib/utils";
import { Calendar, Tag, BookOpen, Trash2, Pencil } from "lucide-react";

interface NoteSource { id: string; title: string; type: string; }
interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; tags: string[];
  sources: NoteSource[];
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
          <button onClick={() => onEdit(note)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{note.content}</p>

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      )}

      {note.sources.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-medium">Sumber belajar</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {note.sources.map((s) => (
              <span key={s.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s.type === "youtube" ? "bg-red-50 text-red-700"
                : s.type === "book" ? "bg-amber-50 text-amber-700"
                : "bg-blue-50 text-blue-700"}`}>
                {s.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
