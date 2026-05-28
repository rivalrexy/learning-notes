"use client";

import { useEffect, useState } from "react";
import NoteCard from "@/app/components/NoteCard";
import NoteModal from "@/app/components/NoteModal";
import NotePreviewModal from "@/app/components/NotePreviewModal";
import Pagination from "@/app/components/Pagination";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { CATEGORY_COLOR } from "@/app/lib/categories";
import DatePicker from "@/app/components/DatePicker";
import ShareAllButton from "@/app/components/ShareAllButton";
import { Plus, CalendarDays, Search, Loader2, LayoutGrid, List, Pencil, Trash2, X, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface Source { id: string; title: string; type: string; url?: string; }
interface Note {
  id: string; type: "weekly"; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; category: string; sources: Source[];
  isPublic?: boolean; shareToken?: string | null;
}

type ViewMode = "card" | "table";
type SortKey = "date" | "title" | "category";
type SortDir = "asc" | "desc";
const CARDS_PER_PAGE = 6;
const ROWS_PER_PAGE  = 20;

export default function WeeklyPage() {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [sources, setSources]   = useState<Source[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const [search, setSearch]               = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate]       = useState("");
  const [viewMode, setViewMode]           = useState<ViewMode>("card");
  const [sortKey, setSortKey]             = useState<SortKey>("date");
  const [sortDir, setSortDir]             = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("weekly-view");
    if (saved === "card" || saved === "table") setViewMode(saved);
  }, []);

  const load = async () => {
    const [n, s] = await Promise.all([
      fetch("/api/notes?type=weekly").then((r) => r.json()),
      fetch("/api/sources").then((r) => r.json()),
    ]);
    setNotes(Array.isArray(n) ? n : []);
    setSources(Array.isArray(s) ? s : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, filterCategory, filterDate, viewMode]);

  const setView = (v: ViewMode) => { setViewMode(v); localStorage.setItem("weekly-view", v); };

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
      : <ArrowUpDown className="w-3 h-3 text-gray-300 dark:text-gray-600" />;

  const handleSave = () => { setShowModal(false); setEditNote(null); load(); };
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load();
  };

  const usedCategories = [...new Set(notes.map((n) => n.category).filter(Boolean))];

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    if (q && !n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false;
    if (filterCategory && n.category !== filterCategory) return false;
    if (filterDate     && n.date < filterDate)           return false;
    return true;
  });

  const perPage = viewMode === "card" ? CARDS_PER_PAGE : ROWS_PER_PAGE;
  const sortedForTable = viewMode === "table" ? [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "date")     cmp = a.date.localeCompare(b.date);
    if (sortKey === "title")    cmp = a.title.localeCompare(b.title, "id");
    if (sortKey === "category") cmp = a.category.localeCompare(b.category, "id");
    return sortDir === "asc" ? cmp : -cmp;
  }) : filtered;
  const paginated = sortedForTable.slice((page - 1) * perPage, page * perPage);

  const grouped = paginated.reduce<Record<string, Note[]>>((acc, note) => {
    const key = String(note.year ?? "");
    (acc[key] ??= []).push(note);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600" />
            Catatan Mingguan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{notes.length} catatan tersimpan</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareAllButton
            type="weekly"
            totalNotes={notes.length}
            publicCount={notes.filter((n) => n.isPublic).length}
            onDone={load}
          />
          <button
            onClick={() => { setEditNote(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Tambah Catatan
          </button>
        </div>
      </div>

      {/* Search + View toggle */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari catatan mingguan..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shrink-0">
          <button onClick={() => setView("card")} title="Tampilan kartu"
            className={`p-2 transition-colors ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("table")} title="Tampilan tabel"
            className={`p-2 transition-colors ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-2">
        <div className="w-56">
          <DatePicker value={filterDate} onChange={setFilterDate} />
        </div>
        {filterDate && (
          <button onClick={() => setFilterDate("")}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Category filter */}
      {usedCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!filterCategory ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
            Semua Kategori
          </button>
          {usedCategories.map((cat) => {
            const c = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR["Lainnya"];
            return (
              <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterCategory === cat ? `${c.bg} ${c.text} border-current` : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-base font-medium">{notes.length === 0 ? "Belum ada catatan mingguan" : "Tidak ada yang cocok"}</p>
          {notes.length === 0 && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Buat catatan pertama</button>
          )}
        </div>
      ) : viewMode === "card" ? (
        <>
          <div className="space-y-8">
            {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearNotes]) => (
              <div key={year}>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Tahun {year}</h2>
                <div className="space-y-3">
                  {yearNotes.map((note) => (
                    <div key={note.id}>
                      {note.weekNumber && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                            Pekan {note.weekNumber}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{getWeekRange(note.weekNumber, note.year!)}</span>
                        </div>
                      )}
                      <NoteCard note={note}
                        onEdit={(n) => { setEditNote(n as Note); setShowModal(true); }}
                        onDelete={handleDelete} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
        </>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-32">
                    <button onClick={() => handleSort("category")} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Kategori <SortIcon col="category" /></button>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <button onClick={() => handleSort("title")} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Judul <SortIcon col="title" /></button>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36 hidden sm:table-cell">
                    <button onClick={() => handleSort("date")} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Pekan <SortIcon col="date" /></button>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Tags</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginated.map((note) => {
                  const c = CATEGORY_COLOR[note.category] ?? CATEGORY_COLOR["Lainnya"];
                  return (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                      onClick={() => setPreviewNote(note)}>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{note.category || "Lainnya"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{note.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">{note.content.replace(/[#*`>_]/g, "").slice(0, 80)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {note.weekNumber ? (
                          <div>
                            <div className="font-medium text-purple-600 dark:text-purple-400">Pekan {note.weekNumber}</div>
                            <div className="text-gray-400 mt-0.5">{getWeekRange(note.weekNumber, note.year!)}</div>
                          </div>
                        ) : formatDate(note.date)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {note.tags.slice(0, 2).map((t) => (
                            <span key={t} className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">#{t}</span>
                          ))}
                          {note.tags.length > 2 && <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEditNote(note); setShowModal(true); }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(note.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
        </>
      )}

      {showModal && (
        <NoteModal type="weekly" note={editNote as never} sources={sources}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditNote(null); }} />
      )}
      {previewNote && (
        <NotePreviewModal note={previewNote} showActions
          onEdit={() => { setPreviewNote(null); setEditNote(previewNote); setShowModal(true); }}
          onDelete={() => { setPreviewNote(null); handleDelete(previewNote.id); }}
          onClose={() => setPreviewNote(null)} />
      )}
    </div>
  );
}
