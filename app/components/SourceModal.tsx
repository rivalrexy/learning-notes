"use client";

import { useState } from "react";
import { LearningSource, SourceType } from "@/app/types";
import { X, Upload } from "lucide-react";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface Props {
  source?: LearningSource | null;
  onSave: (source: LearningSource) => void;
  onClose: () => void;
}

const sourceTypes: { value: SourceType; label: string; color: string }[] = [
  { value: "youtube", label: "YouTube", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
  { value: "book", label: "Buku", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
  { value: "article", label: "Artikel", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
  { value: "other", label: "Lainnya", color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" },
];

export default function SourceModal({ source, onSave, onClose }: Props) {
  const [type, setType] = useState<SourceType>(source?.type ?? "youtube");
  const [title, setTitle] = useState(source?.title ?? "");
  const [author, setAuthor] = useState(source?.author ?? "");
  const [url, setUrl] = useState(source?.url ?? "");
  const [cover, setCover] = useState<string | null>(null);
  const [description, setDescription] = useState(source?.description ?? "");

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCover((ev.target?.result as string) ?? null); setUrl(""); };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const finalUrl = type === "book" ? ((cover ?? url.trim()) || undefined) : (url.trim() || undefined);
    onSave({
      id: source?.id ?? generateId(),
      type,
      title: title.trim(),
      author: author.trim() || undefined,
      url: finalUrl,
      description: description.trim() || undefined,
      createdAt: source?.createdAt ?? now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {source ? "Edit Sumber" : "Tambah Sumber Belajar"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Sumber</label>
            <div className="grid grid-cols-4 gap-2">
              {sourceTypes.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    type === value
                      ? color + " ring-2 ring-offset-1 ring-indigo-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "youtube" ? "Judul video..." : type === "book" ? "Judul buku..." : "Judul..."}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === "youtube" ? "Channel / Pembuat" : "Penulis / Pengarang"}
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={type === "youtube" ? "Nama channel..." : "Nama penulis..."}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {(type === "youtube" || type === "article") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL / Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={type === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {type === "book" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Buku (opsional)</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg py-2.5 cursor-pointer hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors sm:flex-1">
                  <input type="file" accept="image/*" onChange={handleCoverFile} className="sr-only" />
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Upload gambar</span>
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">atau</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setCover(null); }}
                  placeholder="URL gambar cover..."
                  className="w-full sm:flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {(cover ?? url.trim()) && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                  <img
                    src={cover ?? url}
                    alt="Cover"
                    className="w-14 h-20 object-cover rounded border border-gray-100 dark:border-gray-600 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="font-medium text-gray-700 dark:text-gray-200">{title || "Judul buku"}</p>
                    {author && <p className="mt-0.5">{author}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi / Catatan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan singkat tentang sumber ini..."
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
