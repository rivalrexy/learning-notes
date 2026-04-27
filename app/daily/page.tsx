"use client";

import { useEffect, useState } from "react";
import NoteCard from "@/app/components/NoteCard";
import NoteModal from "@/app/components/NoteModal";
import { Plus, Calendar, Search, Loader2 } from "lucide-react";

interface Source { id: string; title: string; type: string; url?: string; }
interface Note {
  id: string; type: "daily"; title: string; content: string;
  date: string; tags: string[]; sources: Source[];
  isPublic?: boolean; shareToken?: string | null;
}

export default function DailyPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const load = async () => {
    const [n, s] = await Promise.all([
      fetch("/api/notes?type=daily").then((r) => r.json()),
      fetch("/api/sources").then((r) => r.json()),
    ]);
    setNotes(Array.isArray(n) ? n : []);
    setSources(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = () => { setShowModal(false); setEditNote(null); load(); };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load();
  };

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];

  const filtered = notes.filter((n) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || n.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  const grouped = filtered.reduce<Record<string, Note[]>>((acc, note) => {
    const month = note.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(note);
    return acc;
  }, {});

  const monthLabels: Record<string, string> = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
  };
  const formatMonth = (ym: string) => {
    const [year, month] = ym.split("-");
    return `${monthLabels[month]} ${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Catatan Harian
          </h1>
          <p className="text-gray-500 mt-1">{notes.length} catatan tersimpan</p>
        </div>
        <button
          onClick={() => { setEditNote(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Tambah Catatan
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari catatan..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterTag("")} className={`px-3 py-2 rounded-lg text-xs font-medium border ${!filterTag ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              Semua
            </button>
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border ${filterTag === tag ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-base font-medium">{notes.length === 0 ? "Belum ada catatan harian" : "Tidak ada yang cocok"}</p>
          {notes.length === 0 && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-indigo-600 hover:underline">
              Buat catatan pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, monthNotes]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{formatMonth(month)}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {monthNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onEdit={(n) => { setEditNote(n as Note); setShowModal(true); }} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NoteModal
          type="daily" note={editNote as never} sources={sources}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditNote(null); }}
        />
      )}
    </div>
  );
}
