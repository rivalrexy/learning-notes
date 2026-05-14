"use client";

import { useEffect, useState, useMemo } from "react";
import NoteCard from "@/app/components/NoteCard";
import { Globe, Search, Loader2, Users, ChevronDown, X, AlertCircle, LayoutGrid, List } from "lucide-react";
import { CATEGORY_COLOR } from "@/app/lib/categories";
import { formatDate } from "@/app/lib/utils";

interface NoteSource { id: string; title: string; type: string; url?: string | null; }
interface Author { id: string; name: string; }
interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; category?: string; sources: NoteSource[];
  isPublic: boolean; shareToken?: string | null;
  user: Author;
}

type ViewMode = "card" | "table";

export default function JelajahiPage() {
  const [notes, setNotes]   = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("jelajahi-view") as ViewMode) ?? "card";
    return "card";
  });

  const setView = (v: ViewMode) => { setViewMode(v); localStorage.setItem("jelajahi-view", v); };

  useEffect(() => {
    setError(null);
    fetch("/api/explore")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Gagal memuat catatan");
        setNotes(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message ?? "Terjadi kesalahan"))
      .finally(() => setLoading(false));
  }, []);

  const authors = useMemo<Author[]>(() => {
    const map = new Map<string, string>();
    notes.forEach((n) => { if (n.user) map.set(n.user.id, n.user.name); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [notes]);

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const matchUser = !filterUserId || n.user?.id === filterUserId;
      const q = search.toLowerCase();
      const matchSearch = !q
        || n.title.toLowerCase().includes(q)
        || n.content.toLowerCase().includes(q)
        || n.tags.some((t) => t.includes(q));
      return matchUser && matchSearch;
    });
  }, [notes, search, filterUserId]);

  const selectedAuthor = authors.find((a) => a.id === filterUserId);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-600" />
            Jelajahi Catatan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Temukan catatan belajar publik dari komunitas
          </p>
        </div>
        {!loading && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {filtered.length} catatan ditemukan · {authors.length} pelajar
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, isi, atau tag..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* User filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown((v) => !v)}
            className={`flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
              filterUserId
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="max-w-32 truncate">
              {selectedAuthor ? selectedAuthor.name : "Semua Pelajar"}
            </span>
            {filterUserId ? (
              <X
                className="w-3.5 h-3.5 shrink-0 opacity-80 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setFilterUserId(""); setShowUserDropdown(false); }}
              />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>

          {showUserDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setFilterUserId(""); setShowUserDropdown(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    !filterUserId ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  Semua Pelajar
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                {authors.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">Belum ada catatan publik</p>
                )}
                {authors.map((a) => {
                  const count = notes.filter((n) => n.user.id === a.id).length;
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setFilterUserId(a.id); setShowUserDropdown(false); }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                        filterUserId === a.id
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 shrink-0">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{a.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{count} catatan</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shrink-0">
          <button onClick={() => setView("card")}
            className={`p-2 transition-colors ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            title="Tampilan kartu"><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("table")}
            className={`p-2 transition-colors ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            title="Tampilan tabel"><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Active filter chips */}
      {(filterUserId || search) && (
        <div className="flex flex-wrap gap-2 -mt-2">
          {filterUserId && selectedAuthor && (
            <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
              <div className="w-4 h-4 bg-indigo-200 dark:bg-indigo-700 rounded-full flex items-center justify-center text-[8px] font-bold">
                {selectedAuthor.name.charAt(0).toUpperCase()}
              </div>
              {selectedAuthor.name}
              <button onClick={() => setFilterUserId("")} className="ml-0.5 hover:text-indigo-900 dark:hover:text-indigo-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
              <Search className="w-3 h-3" />
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")} className="ml-0.5 hover:text-gray-900 dark:hover:text-gray-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-24 text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); fetch("/api/explore").then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data?.error ?? "Gagal memuat catatan"); setNotes(Array.isArray(data) ? data : []); }).catch((err) => setError(err.message ?? "Terjadi kesalahan")).finally(() => setLoading(false)); }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 dark:text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-25" />
          <p className="text-base font-medium">
            {notes.length === 0
              ? "Belum ada catatan publik"
              : "Tidak ada catatan yang cocok"}
          </p>
          <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">
            {notes.length === 0
              ? "Jadilah yang pertama berbagi catatan belajarmu!"
              : "Coba ubah filter atau kata kunci pencarian."}
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-32">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Judul</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-28 hidden sm:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Pelajar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((note) => {
                const cat = note.category || "Lainnya";
                const c = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR["Lainnya"];
                return (
                  <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{cat}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{note.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">{note.content.replace(/[#*`>_]/g, "").slice(0, 80)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">{formatDate(note.date)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {note.user && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-[9px] font-bold text-indigo-600 dark:text-indigo-300 shrink-0">
                            {note.user.name.charAt(0).toUpperCase()}
                          </div>
                          {note.user.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.slice(0, 2).map((t) => (
                          <span key={t} className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">#{t}</span>
                        ))}
                        {note.tags.length > 2 && <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
