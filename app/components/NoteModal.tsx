"use client";

import { useRef, useState } from "react";
import { NoteType } from "@/app/types";
import { getWeekNumber, getWeekStartDate, getYouTubeThumbnail, todayISO } from "@/app/lib/utils";
import {
  X, Plus, Minus, Loader2, Check,
  Play, BookOpen, FileText, HelpCircle,
} from "lucide-react";
import DatePicker from "@/app/components/DatePicker";
import WeekPicker from "@/app/components/WeekPicker";
import TiptapEditor from "@/app/components/TiptapEditor";
import EmojiPicker from "@/app/components/EmojiPicker";

type SrcType = "youtube" | "book" | "article" | "other";

interface Source { id: string; title: string; type: string; url?: string | null; }
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

const srcIcon: Record<string, React.ReactNode> = {
  youtube:  <Play className="w-5 h-5 text-red-500" />,
  book:     <BookOpen className="w-5 h-5 text-amber-500" />,
  article:  <FileText className="w-5 h-5 text-blue-500" />,
  other:    <HelpCircle className="w-5 h-5 text-gray-400" />,
};
const srcBg: Record<string, string> = {
  youtube: "bg-red-50 dark:bg-red-900/20",
  book: "bg-amber-50 dark:bg-amber-900/20",
  article: "bg-blue-50 dark:bg-blue-900/20",
  other: "bg-gray-50 dark:bg-gray-700",
};
const srcTypeLabel: Record<SrcType, string> = {
  youtube: "YouTube", book: "Buku", article: "Artikel", other: "Lainnya",
};
const srcTypeColor: Record<SrcType, string> = {
  youtube: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  book:    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  article: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  other:   "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
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

  const titleRef = useRef<HTMLInputElement>(null);

  const insertTitleEmoji = (emoji: string) => {
    const input = titleRef.current;
    if (!input) { setTitle((t) => t + emoji); return; }
    const start = input.selectionStart ?? title.length;
    const end = input.selectionEnd ?? title.length;
    const newTitle = title.slice(0, start) + emoji + title.slice(end);
    setTitle(newTitle);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const [localSources, setLocalSources] = useState<Source[]>(sources);

  const [addingSource, setAddingSource] = useState(false);
  const [nsType, setNsType] = useState<SrcType>("youtube");
  const [nsTitle, setNsTitle] = useState("");
  const [nsUrl, setNsUrl] = useState("");
  const [nsAuthor, setNsAuthor] = useState("");
  const [savingNs, setSavingNs] = useState(false);

  const ytThumb = nsType === "youtube" && nsUrl ? getYouTubeThumbnail(nsUrl) : null;

  const resetNewSource = () => {
    setNsTitle(""); setNsUrl(""); setNsAuthor(""); setNsType("youtube");
  };

  const saveNewSource = async () => {
    if (!nsTitle.trim()) return;
    setSavingNs(true);
    const urlToSave = nsUrl || null;
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: nsType,
          title: nsTitle.trim(),
          author: nsAuthor.trim() || null,
          url: urlToSave,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setLocalSources((prev) => [saved, ...prev]);
        setSelectedSources((prev) => [...prev, saved.id]);
        setAddingSource(false);
        resetNewSource();
      }
    } finally {
      setSavingNs(false);
    }
  };

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
      if (res.ok) onSave(await res.json());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {note ? "Edit Catatan" : type === "daily" ? "Catatan Harian" : "Catatan Mingguan"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Judul</label>
            <div className="relative flex items-center">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul catatan..."
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
              />
              <div className="absolute right-2">
                <EmojiPicker onSelect={insertTitleEmoji} />
              </div>
            </div>
          </div>

          {/* Date / Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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

          {/* Isi Catatan */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Isi Catatan</label>
            <TiptapEditor value={content} onChange={setContent} />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Tambah tag, tekan Enter"
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
              />
              <button onClick={addTag} className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full">
                    {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sumber Belajar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sumber Belajar</label>
              <button
                type="button"
                onClick={() => { setAddingSource((v) => !v); if (addingSource) resetNewSource(); }}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baru
              </button>
            </div>

            {/* Inline add source form */}
            {addingSource && (
              <div className="border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl p-4 mb-3 bg-indigo-50/30 dark:bg-indigo-900/10 space-y-3">

                {/* Type selector */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(["youtube", "book", "article", "other"] as SrcType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setNsType(t); setNsUrl(""); }}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        nsType === t ? srcTypeColor[t] + " ring-1 ring-offset-1 ring-indigo-300" : "border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      {srcTypeLabel[t]}
                    </button>
                  ))}
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={nsTitle}
                  onChange={(e) => setNsTitle(e.target.value)}
                  placeholder={nsType === "youtube" ? "Judul video..." : nsType === "book" ? "Judul buku..." : "Judul..."}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Author */}
                {(nsType === "youtube" || nsType === "book") && (
                  <input
                    type="text"
                    value={nsAuthor}
                    onChange={(e) => setNsAuthor(e.target.value)}
                    placeholder={nsType === "youtube" ? "Nama channel..." : "Nama penulis..."}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {/* YouTube / Article: URL + live thumbnail */}
                {(nsType === "youtube" || nsType === "article") && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={nsUrl}
                      onChange={(e) => setNsUrl(e.target.value)}
                      placeholder={nsType === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {ytThumb && (
                      <div className="relative rounded-lg overflow-hidden">
                        <img src={ytThumb} alt="Thumbnail" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Book: URL cover saja */}
                {nsType === "book" && (
                  <input
                    type="url"
                    value={nsUrl}
                    onChange={(e) => setNsUrl(e.target.value)}
                    placeholder="URL cover buku (opsional)..."
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}

                {/* Form actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setAddingSource(false); resetNewSource(); }}
                    className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={saveNewSource}
                    disabled={!nsTitle.trim() || savingNs}
                    className="flex-1 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {savingNs && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Tambah Sumber
                  </button>
                </div>
              </div>
            )}

            {/* Source selection grid */}
            {localSources.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-0.5">
                {localSources.map((s) => {
                  const isSelected = selectedSources.includes(s.id);
                  const thumbnail = s.type === "youtube" && s.url ? getYouTubeThumbnail(s.url) : null;
                  const cover = s.type === "book" && s.url ? s.url : null;
                  const mediaUrl = thumbnail ?? cover;

                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSource(s.id)}
                      className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                        isSelected ? "border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900" : "border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt=""
                          className="w-full h-16 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className={`h-16 flex items-center justify-center ${srcBg[s.type] ?? "bg-gray-50 dark:bg-gray-700"}`}>
                          {srcIcon[s.type] ?? srcIcon.other}
                        </div>
                      )}
                      <div className="px-2 py-1.5 bg-white dark:bg-gray-700">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{s.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{s.type}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !addingSource && (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-3 text-center border border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                Belum ada sumber. Klik <strong>Tambah Baru</strong> untuk menambahkan.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || saving}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </div>
      </div>
    </div>
  );
}
