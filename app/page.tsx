"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getWeekRange, stripMarkdown } from "@/app/lib/utils";
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
  const recentNotes = notes.slice(0, 8);

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

  // Monthly progress: weekly notes per month this year
  const monthlyData = Array.from({ length: 12 }, (_, m) => {
    const monthStr = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
    const count = weeklyNotes.filter((n) => n.year === currentYear && n.date.startsWith(monthStr)).length;
    return { month: new Date(currentYear, m, 1).toLocaleString("id-ID", { month: "short" }), count };
  });
  const maxMonthlyCount = Math.max(...monthlyData.map((m) => m.count), 1);

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

      {/* Weekly consistency + Ringkasan Mingguan */}
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

        {/* Ringkasan Mingguan sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-5">

          {/* Summary numbers */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Ringkasan Mingguan
            </h2>
            <div className="space-y-2.5">
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
          </div>

          {/* Category breakdown */}
          {weeklyCatData.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5" /> Kategori
              </p>
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
            </div>
          )}

          {/* Monthly progress bar chart */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Per Bulan · {currentYear}
            </p>
            <div className="flex items-end gap-1" style={{ height: "48px" }}>
              {monthlyData.map(({ month, count }) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {count > 0 && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap shadow-md z-10">
                      {count} pekan
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-sm transition-all ${count > 0 ? "bg-indigo-400 dark:bg-indigo-500" : "bg-gray-100 dark:bg-gray-700"}`}
                    style={{ height: `${count > 0 ? Math.max(Math.round((count / maxMonthlyCount) * 36), 4) : 3}px` }}
                  />
                  <span className="text-[7px] text-gray-400 dark:text-gray-600 leading-none">{month.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top tags */}
          {topWeeklyTags.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Topik
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topWeeklyTags.slice(0, 8).map(([tag, count]) => (
                  <span key={tag}
                    className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                    <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-1 rounded-full text-[10px]">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Source distribution — full width */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <PieChart className="w-4 h-4 text-amber-600" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Distribusi Sumber</h2>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{sources.length} sumber total</span>
        </div>
        {sources.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Belum ada sumber</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {sourceDistribution.map(({ label, count, color, bar }) => (
              <div key={label} className="flex flex-col gap-2">
                <div className={`text-3xl font-bold ${color}`}>{count}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${bar} rounded-full transition-all`}
                    style={{ width: `${(count / sources.length) * 100}%` }} />
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {Math.round((count / sources.length) * 100)}% dari total
                </div>
              </div>
            ))}
          </div>
        )}
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
                    {stripMarkdown(note.content)}
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
