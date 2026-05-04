"use client";

import { useEffect, useState } from "react";
import SourceModal from "@/app/components/SourceModal";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { Plus, Library, PlayCircle, BookOpen, FileText, Globe, Trash2, Pencil, ExternalLink, Search, Loader2 } from "lucide-react";

type SourceType = "youtube" | "book" | "article" | "other";

interface Source {
  id: string; type: SourceType; title: string;
  author?: string; url?: string; description?: string; createdAt: string;
}

const typeConfig: Record<SourceType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  youtube: { label: "YouTube", icon: PlayCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
  book: { label: "Buku", icon: BookOpen, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  article: { label: "Artikel", icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  other: { label: "Lainnya", icon: Globe, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-700" },
};

const filterTabs: { value: SourceType | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "youtube", label: "YouTube" },
  { value: "book", label: "Buku" },
  { value: "article", label: "Artikel" },
  { value: "other", label: "Lainnya" },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSource, setEditSource] = useState<Source | null>(null);
  const [filterType, setFilterType] = useState<SourceType | "all">("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    const s = await fetch("/api/sources").then((r) => r.json());
    setSources(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Source, "id" | "createdAt"> & { id?: string }) => {
    const url = data.id ? `/api/sources/${data.id}` : "/api/sources";
    const method = data.id ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    setEditSource(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sumber belajar ini?")) return;
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = sources.filter((s) => {
    const matchType = filterType === "all" || s.type === filterType;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.author ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = sources.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Library className="w-6 h-6 text-amber-600" />
            Sumber Belajar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{sources.length} sumber tersimpan</p>
        </div>
        <button
          onClick={() => { setEditSource(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Sumber
        </button>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["youtube", "book", "article", "other"] as SourceType[]).map((type) => {
          const { label, icon: Icon, color, bg } = typeConfig[type];
          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{counts[type] ?? 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari sumber belajar..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map(({ value, label }) => (
            <button key={value} onClick={() => setFilterType(value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${filterType === value ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <Library className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-base font-medium">{sources.length === 0 ? "Belum ada sumber belajar" : "Tidak ada yang cocok"}</p>
          {sources.length === 0 && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Tambah sumber pertama</button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((source) => {
            const { icon: Icon, color, bg, label } = typeConfig[source.type];
            const ytThumb = source.type === "youtube" && source.url ? getYouTubeThumbnail(source.url) : null;
            const bookCover = source.type === "book" && source.url ? source.url : null;
            const thumbnail = ytThumb ?? bookCover;
            return (
              <div key={source.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                {thumbnail ? (
                  <div className="relative h-36 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={thumbnail}
                      alt={source.title}
                      className={`w-full h-full ${bookCover ? "object-contain bg-gray-50 dark:bg-gray-700" : "object-cover"}`}
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                    />
                    {ytThumb && (
                      <>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">YT</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={`h-12 ${bg} flex items-center px-5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className={`ml-2 text-xs font-semibold ${color}`}>{label}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{source.title}</h3>
                      {source.author && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{source.author}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditSource(source); setShowModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(source.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {source.description && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{source.description}</p>}
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Buka link
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <SourceModal
          source={editSource as never}
          onSave={handleSave as never}
          onClose={() => { setShowModal(false); setEditSource(null); }}
        />
      )}
    </div>
  );
}
