"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { CATEGORY_COLOR } from "@/app/lib/categories";
import {
  Calendar, CalendarDays, Library, BookOpen,
  TrendingUp, FileText, Tag,
  CalendarCheck, ChevronRight, Award, PieChart,
  CheckCircle2,
} from "lucide-react";

interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; category?: string;
}
interface Source { id: string; type: string; title: string; }

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
}

function calcWeeklyStreak(weeklyNotes: Note[]): number {
  if (weeklyNotes.length === 0) return 0;
  const noteWeekSet = new Set(weeklyNotes.map((n) => `${n.year}-${n.weekNumber}`));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i <= 52; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 7);
    const week = getISOWeekNumber(d);
    const year = d.getFullYear();
    if (noteWeekSet.has(`${year}-${week}`)) {
      streak++;
    } else {
      if (i === 0) continue; // current week may not have a note yet
      break;
    }
  }
  return streak;
}

interface WeekCell { weekNumber: number; year: number; hasNote: boolean; label: string; }

function getWeeklyActivityCells(weeklyNotes: Note[]): WeekCell[] {
  const noteWeekSet = new Set(weeklyNotes.map((n) => `${n.year}-${n.weekNumber}`));
  const today = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (23 - i) * 7);
    const weekNum = getISOWeekNumber(d);
    const year = d.getFullYear();
    return {
      weekNumber: weekNum, year,
      hasNote: noteWeekSet.has(`${year}-${weekNum}`),
      label: `Pekan ${weekNum} ${year}`,
    };
  });
}

export default function Dashboard() {
  const [notes, setNotes]     = useState<Note[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/sources").then((r) => r.json()),
    ])
      .then(([n, s]) => {
        setNotes(Array.isArray(n) ? n : []);
        setSources(Array.isArray(s) ? s : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dailyNotes  = notes.filter((n) => n.type === "daily");
  const weeklyNotes = notes.filter((n) => n.type === "weekly");
  const recentNotes = notes.slice(0, 6);

  // Weekly activity
  const weeklyStreak       = calcWeeklyStreak(weeklyNotes);
  const weeklyActivityCells = getWeeklyActivityCells(weeklyNotes);
  const currentYear        = new Date().getFullYear();
  const weeklyThisYear     = weeklyNotes.filter((n) => n.year === currentYear).length;
  const latestWeekly       = weeklyNotes[0] ?? null;

  // Weekly category breakdown
  const weeklyCatCounts = weeklyNotes.reduce<Record<string, number>>((acc, n) => {
    const cat = n.category ?? "Lainnya";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const weeklyCatData  = Object.entries(weeklyCatCounts).sort(([, a], [, b]) => b - a);
  const maxWeeklyCat   = Math.max(...weeklyCatData.map(([, c]) => c), 1);

  // Weekly top tags
  const weeklyTagCounts = weeklyNotes
    .flatMap((n) => n.tags)
    .reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const topWeeklyTags = Object.entries(weeklyTagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Source distribution
  const sourceCounts: Record<string, number> = { youtube: 0, book: 0, article: 0, other: 0 };
  sources.forEach((s) => { if (s.type in sourceCounts) sourceCounts[s.type]++; });
  const sourceDistribution = [
    { label: "YouTube", count: sourceCounts.youtube, color: "text-red-600 dark:text-red-400",   bar: "bg-red-400 dark:bg-red-500" },
    { label: "Buku",    count: sourceCounts.book,    color: "text-amber-600 dark:text-amber-400", bar: "bg-amber-400 dark:bg-amber-500" },
    { label: "Artikel", count: sourceCounts.article, color: "text-blue-600 dark:text-blue-400",  bar: "bg-blue-400 dark:bg-blue-500" },
    { label: "Lainnya", count: sourceCounts.other,   color: "text-gray-500 dark:text-gray-400",  bar: "bg-gray-400 dark:bg-gray-500" },
  ];

  const stats = [
    { label: "Catatan Harian",   value: dailyNotes.length,  icon: Calendar,     color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",       href: "/daily" },
    { label: "Catatan Mingguan", value: weeklyNotes.length, icon: CalendarDays, color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", href: "/weekly" },
    { label: "Sumber Belajar",   value: sources.length,     icon: Library,      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",    href: "/sources" },
    { label: "Total Catatan",    value: notes.length,       icon: FileText,     color: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",    href: "/" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Selamat datang di catatan belajar kita</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Weekly spotlight */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent weekly notes */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-600" />
              Catatan Mingguan Terbaru
            </h2>
            <Link href="/weekly" className="flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {weeklyNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada catatan mingguan.</p>
              <Link href="/weekly" className="mt-2 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                Buat catatan pertama
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {weeklyNotes.slice(0, 4).map((note) => {
                const cat = note.category ?? "Lainnya";
                const c   = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR["Lainnya"];
                return (
                  <div key={note.id}
                    className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-800 transition-colors flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {note.weekNumber && (
                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Pekan {note.weekNumber}
                        </span>
                      )}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{cat}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{note.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                      {note.content.replace(/[#*`>_\[\]]/g, "").slice(0, 120)}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {note.weekNumber && note.year ? getWeekRange(note.weekNumber, note.year) : formatDate(note.date)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly stats sidebar */}
        <div className="space-y-4">
          {/* Summary + category breakdown in one card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Ringkasan Mingguan
            </h2>
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total pekan</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{weeklyNotes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tahun {currentYear}</span>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{weeklyThisYear} pekan</span>
              </div>
              {latestWeekly?.weekNumber && latestWeekly.year && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Terakhir</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pekan {latestWeekly.weekNumber}</span>
                </div>
              )}
            </div>

            {weeklyCatData.length > 0 && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-3">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5" /> Kategori
                  </p>
                </div>
                <div className="space-y-2">
                  {weeklyCatData.map(([cat, count]) => {
                    const c = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR["Lainnya"];
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`font-medium ${c.text}`}>{cat}</span>
                          <span className="text-gray-400 dark:text-gray-500">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${c.bg}`}
                            style={{ width: `${(count / maxWeeklyCat) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Top topics */}
          {topWeeklyTags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Topik Mingguan
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {topWeeklyTags.map(([tag, count]) => (
                  <span key={tag}
                    className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-1 rounded-full">
                    {tag}
                    <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-1 rounded-full text-[10px]">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly consistency + Source distribution */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Weekly heatmap */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{weeklyStreak}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">pekan berturut-turut</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {weeklyStreak === 0 ? "Isi catatan minggu ini untuk mulai streak!"
                    : weeklyStreak >= 4 ? "Konsisten banget! Pertahankan 🔥"
                    : "Terus isi tiap minggu!"}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">24 minggu terakhir</span>
          </div>

          {/* Weekly activity cells — 3 rows × 8 weeks */}
          <div className="space-y-1.5">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-1.5">
                {weeklyActivityCells.slice(row * 8, row * 8 + 8).map((cell, i) => (
                  <div key={i} title={cell.label + (cell.hasNote ? " ✓" : " —")}
                    className={`flex-1 h-8 rounded-lg transition-colors flex items-center justify-center ${
                      cell.hasNote
                        ? "bg-purple-500 dark:bg-purple-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600"
                    }`}>
                    {cell.hasNote
                      ? <CheckCircle2 className="w-3.5 h-3.5" />
                      : <span className="text-[9px] font-medium">{cell.weekNumber}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-purple-500 flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
              <span>Ada catatan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700" />
              <span>Tidak ada</span>
            </div>
            <span className="ml-auto">
              {weeklyActivityCells.filter((c) => c.hasNote).length} dari 24 minggu terisi
            </span>
          </div>
        </div>

        {/* Source distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Distribusi Sumber</h2>
          </div>
          {sources.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Belum ada sumber</p>
          ) : (
            <div className="space-y-3">
              {sourceDistribution.map(({ label, count, color, bar }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-medium ${color}`}>{label}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {count} · {Math.round((count / sources.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full transition-all`}
                      style={{ width: `${(count / sources.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Catatan Terbaru
          </h2>
          <Link href="/daily" className="flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada catatan. Mulai tambahkan!</p>
            <Link href="/daily" className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Buat catatan pertama
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  note.type === "daily" ? "bg-blue-50 dark:bg-blue-900/30" : "bg-purple-50 dark:bg-purple-900/30"
                }`}>
                  {note.type === "daily"
                    ? <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    : <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{note.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {note.type === "weekly" && note.weekNumber
                      ? `Pekan ${note.weekNumber} · ${getWeekRange(note.weekNumber, note.year!)}`
                      : formatDate(note.date)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {note.content.replace(/[#*`>_\[\]]/g, "").slice(0, 80)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
