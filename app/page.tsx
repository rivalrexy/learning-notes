"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { Calendar, CalendarDays, Library, BookOpen, TrendingUp, FileText } from "lucide-react";

interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; year?: number; tags: string[];
}
interface Source { id: string; type: string; title: string; }

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/sources").then((r) => r.json()),
    ]).then(([n, s]) => {
      setNotes(Array.isArray(n) ? n : []);
      setSources(Array.isArray(s) ? s : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const dailyNotes = notes.filter((n) => n.type === "daily");
  const weeklyNotes = notes.filter((n) => n.type === "weekly");
  const recentNotes = notes.slice(0, 5);

  const stats = [
    { label: "Catatan Harian", value: dailyNotes.length, icon: Calendar, color: "bg-blue-50 text-blue-600", href: "/daily" },
    { label: "Catatan Mingguan", value: weeklyNotes.length, icon: CalendarDays, color: "bg-purple-50 text-purple-600", href: "/weekly" },
    { label: "Sumber Belajar", value: sources.length, icon: Library, color: "bg-amber-50 text-amber-600", href: "/sources" },
    { label: "Total Catatan", value: notes.length, icon: FileText, color: "bg-green-50 text-green-600", href: "/" },
  ];

  const allTags = notes.flatMap((n) => n.tags);
  const tagCounts = allTags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang di catatan belajarmu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Catatan Terbaru
            </h2>
            <Link href="/daily" className="text-xs text-indigo-600 hover:underline">Lihat semua</Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada catatan. Mulai tambahkan!</p>
              <Link href="/daily" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
                Buat catatan pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${note.type === "daily" ? "bg-blue-50" : "bg-purple-50"}`}>
                    {note.type === "daily"
                      ? <Calendar className="w-4 h-4 text-blue-600" />
                      : <CalendarDays className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{note.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {note.type === "weekly" && note.weekNumber
                        ? `Pekan ${note.weekNumber} · ${getWeekRange(note.weekNumber, note.year!)}`
                        : formatDate(note.date)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Tag Populer</h2>
            {topTags.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada tag</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                    {tag}
                    <span className="bg-indigo-200 text-indigo-800 px-1 rounded-full text-[10px]">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Sumber Terbaru</h2>
            {sources.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada sumber</p>
            ) : (
              <div className="space-y-2">
                {sources.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      s.type === "youtube" ? "bg-red-50 text-red-700" : s.type === "book" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {s.type === "youtube" ? "YT" : s.type === "book" ? "Buku" : "Art"}
                    </span>
                    <p className="text-sm text-gray-700 truncate">{s.title}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/sources" className="mt-3 block text-xs text-indigo-600 hover:underline">
              Kelola sumber belajar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
