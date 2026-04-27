"use client";

import { useEffect, useState } from "react";
import NoteCard from "@/app/components/NoteCard";
import NoteModal from "@/app/components/NoteModal";
import { getWeekRange } from "@/app/lib/utils";
import { Plus, CalendarDays, Search, Loader2 } from "lucide-react";

interface Source { id: string; title: string; type: string; }
interface Note {
  id: string; type: "weekly"; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; sources: Source[];
}

export default function WeeklyPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");

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

  const handleSave = () => { setShowModal(false); setEditNote(null); load(); };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = notes.filter((n) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Note[]>>((acc, note) => {
    const key = String(note.year ?? "");
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600" />
            Catatan Mingguan
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan mingguan..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-base font-medium">{notes.length === 0 ? "Belum ada catatan mingguan" : "Tidak ada yang cocok"}</p>
          {notes.length === 0 && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-indigo-600 hover:underline">Buat catatan pertama</button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearNotes]) => (
            <div key={year}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tahun {year}</h2>
              <div className="space-y-3">
                {yearNotes.map((note) => (
                  <div key={note.id}>
                    {note.weekNumber && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          Pekan {note.weekNumber}
                        </span>
                        <span className="text-xs text-gray-400">{getWeekRange(note.weekNumber, note.year!)}</span>
                      </div>
                    )}
                    <NoteCard note={note} onEdit={(n) => { setEditNote(n as Note); setShowModal(true); }} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NoteModal
          type="weekly" note={editNote as never} sources={sources}
          onSave={handleSave} onClose={() => { setShowModal(false); setEditNote(null); }}
        />
      )}
    </div>
  );
}
