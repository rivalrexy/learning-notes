"use client";

import { useState } from "react";
import { LearningSource, SourceType } from "@/app/types";
import { X } from "lucide-react";

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
  const [description, setDescription] = useState(source?.description ?? "");

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: source?.id ?? generateId(),
      type,
      title: title.trim(),
      author: author.trim() || undefined,
      url: url.trim() || undefined,
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

          {(type === "youtube" || type === "article" || type === "book") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {type === "book" ? "URL Cover / Link Buku (opsional)" : "URL / Link"}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  type === "youtube"
                    ? "https://youtube.com/watch?v=..."
                    : type === "book"
                    ? "https://covers.openlibrary.org/... atau URL gambar cover"
                    : "https://..."
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
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
