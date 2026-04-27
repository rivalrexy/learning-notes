"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { NoteType } from "@/app/types";
import { getWeekNumber, getWeekStartDate, getYouTubeThumbnail, todayISO } from "@/app/lib/utils";
import { X, Plus, Minus, Loader2, Check, Youtube, BookOpen, FileText, HelpCircle } from "lucide-react";
import DatePicker from "@/app/components/DatePicker";
import WeekPicker from "@/app/components/WeekPicker";

interface Source { id: string; title: string; type: string; url?: string; }
interface NoteData {
  id?: string; type: NoteType; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; sources: { id: string }[];
}

interface Props {
  type: NoteType;
  note?: NoteData | null;
  sources: Source[];
  onSave: (note: NoteData) => void;
  onClose: () => void;
}

const sourceIcon: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-6 h-6 text-red-500" />,
  book: <BookOpen className="w-6 h-6 text-amber-500" />,
  article: <FileText className="w-6 h-6 text-blue-500" />,
  other: <HelpCircle className="w-6 h-6 text-gray-400" />,
};
const sourceBg: Record<string, string> = {
  youtube: "bg-red-50",
  book: "bg-amber-50",
  article: "bg-blue-50",
  other: "bg-gray-50",
};

export default function NoteModal({ type, note, sources, onSave, onClose }: Props) {
  const today = todayISO();
  const nowDate = new Date();

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [date, setDate] = useState(note?.date ?? today);
  const [weekNum, setWeekNum] = useState(note?.weekNumber ?? getWeekNumber(nowDate));
  const [weekYear, setWeekYear] = useState(note?.year ?? nowDate.getFullYear());
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [selectedSources, setSelectedSources] = useState<string[]>(
    note?.sources?.map((s) => s.id) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const toggleSource = (id: string) =>
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    let noteDate = date;
    if (type === "weekly") {
      const ws = getWeekStartDate(weekNum, weekYear);
      noteDate = [
        ws.getFullYear(),
        String(ws.getMonth() + 1).padStart(2, "0"),
        String(ws.getDate()).padStart(2, "0"),
      ].join("-");
    }

    try {
      const url = note?.id ? `/api/notes/${note.id}` : "/api/notes";
      const method = note?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          date: noteDate,
          weekNumber: type === "weekly" ? weekNum : null,
          year: type === "weekly" ? weekYear : null,
          tags,
          sourceIds: selectedSources,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        onSave(saved);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {note ? "Edit Catatan" : type === "daily" ? "Catatan Harian" : "Catatan Mingguan"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul catatan..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date / Week picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === "daily" ? "Tanggal" : "Minggu"}
            </label>
            {type === "daily" ? (
              <DatePicker value={date} onChange={setDate} />
            ) : (
              <WeekPicker
                weekNum={weekNum}
                weekYear={weekYear}
                onChange={(wn, yr) => { setWeekNum(wn); setWeekYear(yr); }}
              />
            )}
          </div>

          {/* Isi Catatan + Markdown preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Isi Catatan</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 transition-colors ${!previewMode ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 transition-colors ${previewMode ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  Pratinjau
                </button>
              </div>
            </div>
            {previewMode ? (
              <div className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[9rem] text-sm text-gray-700 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-500 [&_strong]:font-semibold [&_em]:italic">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">Belum ada konten...</p>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan apa yang kamu pelajari... (mendukung Markdown)"
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">Mendukung format Markdown: **bold**, *italic*, # heading, - list</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Tambah tag (enter)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={addTag} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sources — visual cards */}
          {sources.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Belajar</label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {sources.map((s) => {
                  const isSelected = selectedSources.includes(s.id);
                  const thumbnail =
                    s.type === "youtube" && s.url ? getYouTubeThumbnail(s.url) : null;
                  const cover = s.type === "book" && s.url ? s.url : null;
                  const mediaUrl = thumbnail ?? cover;

                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSource(s.id)}
                      className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-100"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {/* Thumbnail / cover / icon */}
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt=""
                          className="w-full h-16 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className={`h-16 flex items-center justify-center ${sourceBg[s.type] ?? "bg-gray-50"}`}>
                          {sourceIcon[s.type] ?? sourceIcon.other}
                        </div>
                      )}

                      {/* Info */}
                      <div className="px-2 py-1.5 bg-white">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{s.title}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{s.type}</p>
                      </div>

                      {/* Check mark */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
