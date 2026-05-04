"use client";

import { useState, useEffect, useRef } from "react";
import { LearningSource, SourceType } from "@/app/types";
import { X, Loader2 } from "lucide-react";

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

const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

export default function SourceModal({ source, onSave, onClose }: Props) {
  const [type, setType] = useState<SourceType>(source?.type ?? "youtube");
  const [title, setTitle] = useState(source?.title ?? "");
  const [author, setAuthor] = useState(source?.author ?? "");
  const [url, setUrl] = useState(source?.url ?? "");
  const [description, setDescription] = useState(source?.description ?? "");
  const [fetching, setFetching] = useState(false);
  const lastFetchedUrl = useRef("");

  useEffect(() => {
    if (type !== "youtube" || !url.trim()) return;
    if (url === lastFetchedUrl.current) return;
    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          lastFetchedUrl.current = url;
          setTitle((prev) => (prev.trim() ? prev : (data.title ?? "")));
          setAuthor((prev) => (prev.trim() ? prev : (data.author_name ?? "")));
        }
      } catch { /* ignore */ }
      setFetching(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [url, type]);

  const isYoutube = type === "youtube";
  const canSave = isYoutube ? url.trim() : title.trim();

  const handleSave = () => {
    const finalTitle = title.trim() || (isYoutube ? url.trim() : "");
    if (!finalTitle) return;
    const now = new Date().toISOString();
    onSave({
      id: source?.id ?? generateId(),
      type,
      title: finalTitle,
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
          {/* Type selector */}
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

          {/* YouTube URL — shown first so auto-fill can populate title */}
          {isYoutube && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL YouTube <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className={inputCls}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul{!isYoutube && <span className="text-red-500"> *</span>}
              {isYoutube && (
                <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">
                  (opsional — otomatis dari YouTube)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isYoutube
                    ? fetching ? "Mengambil judul..." : "Otomatis dari YouTube..."
                    : type === "book" ? "Judul buku..." : "Judul..."
                }
                className={inputCls + (fetching ? " pr-9" : "")}
              />
              {fetching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" />
              )}
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isYoutube ? "Channel / Pembuat" : "Penulis / Pengarang"}
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={isYoutube ? "Nama channel..." : "Nama penulis..."}
              className={inputCls}
            />
          </div>

          {/* URL for article/other */}
          {(type === "article" || type === "other") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL / Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          )}

          {/* Book cover URL */}
          {type === "book" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Cover Buku (opsional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... (URL gambar cover)"
                className={inputCls}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi / Catatan</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan singkat tentang sumber ini..."
              rows={3}
              className={inputCls + " resize-none"}
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
            disabled={!canSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
