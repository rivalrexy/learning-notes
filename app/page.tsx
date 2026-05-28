"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getWeekRange } from "@/app/lib/utils";
import { CATEGORY_COLOR } from "@/app/lib/categories";
import {
  Calendar, CalendarDays, Library, BookOpen,
  TrendingUp, FileText, Flame, Zap, Tag,
  CalendarCheck, ChevronRight, Award,
} from "lucide-react";

interface Note {
  id: string; type: string; title: string; content: string;
  date: string; weekNumber?: number; year?: number;
  tags: string[]; category?: string;
}
interface Source { id: string; type: string; title: string; }

function calcStreak(dailyNotes: Note[]): number {
  const dates = [...new Set(dailyNotes.map((n) => n.date))].sort().reverse();
  if (dates.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86_400_000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function getActivityCells(dailyNotes: Note[]): { date: string; count: number }[] {
  const counts = dailyNotes.reduce<Record<string, number>>((acc, n) => {
    acc[n.date] = (acc[n.date] || 0) + 1;
    return acc;
  }, {});
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 83);
  const cells: { date: string; count: number }[] = [];
  for (let i = 0; i < 84; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    cells.push({ date: iso, count: counts[iso] ?? 0 });
  }
  return cells;
}

const activityColor = (count: number) => {
  if (count === 0) return "bg-gray-100 dark:bg-gray-700";
  if (count === 1) return "bg-green-200 dark:bg-green-800";
  if (count === 2) return "bg-green-400 dark:bg-green-600";
  return "bg-green-600 dark:bg-green-400";
};
const activityLegend = [
  "bg-gray-100 dark:bg-gray-700",
  "bg-green-200 dark:bg-green-800",
  "bg-green-400 dark:bg-green-600",
  "bg-green-600 dark:bg-green-400",
];

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

  const streak       = calcStreak(dailyNotes);
  const activityCells = getActivityCells(dailyNotes);

  // Weekly insights
  const currentYear      = new Date().getFullYear();
  const weeklyThisYear   = weeklyNotes.filter((n) => n.year === currentYear).length;
  const latestWeekly     = weeklyNotes[0] ?? null;

  const weeklyCatCounts  = weeklyNotes.reduce<Record<string, number>>((acc, n) => {
    const cat = n.category ?? "Lainnya";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const weeklyCatData = Object.entries(weeklyCatCounts)
    .sort(([, a], [, b]) => b - a);
  const maxWeeklyCat = Math.max(...weeklyCatData.map(([, c]) => c), 1);

  const weeklyTagCounts = weeklyNotes
    .flatMap((n) => n.tags)
    .reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const topWeeklyTags = Object.entries(weeklyTagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const stats = [
    { label: "Catatan Harian",   value: dailyNotes.length,  icon: Calendar,     color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",     href: "/daily" },
    { label: "Catatan Mingguan", value: weeklyNotes.length, icon: CalendarDays, color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", href: "/weekly" },
    { label: "Sumber Belajar",   value: sources.length,     icon: Library,      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",   href: "/sources" },
    { label: "Total Catatan",    value: notes.length,       icon: FileText,     color: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",   href: "/" },
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
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                        {cat}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                      {note.title}
                    </p>
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

        {/* Weekly stats + insights */}
        <div className="space-y-4">

          {/* Summary numbers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Ringkasan Mingguan
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total pekan</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{weeklyNotes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tahun {currentYear}</span>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{weeklyThisYear} pekan</span>
              </div>
              {latestWeekly && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Terakhir</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Pekan {latestWeekly.weekNumber}
                  </span>
                </div>
              )}
              {latestWeekly?.weekNumber && latestWeekly.year && (
                <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                  {getWeekRange(latestWeekly.weekNumber, latestWeekly.year)}
                </p>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          {weeklyCatData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                Kategori
              </h2>
              <div className="space-y-2.5">
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
                    <span className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-1 rounded-full text-[10px]">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streak + Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{streak}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">hari berturut-turut</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {streak === 0 ? "Buat catatan hari ini untuk memulai streak!"
                  : streak >= 7 ? "Luar biasa! Pertahankan semangatmu 🔥"
                  : "Terus semangat belajar!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span>12 minggu terakhir</span>
          </div>
        </div>

        {/* Activity grid */}
        <div className="flex gap-0.5 overflow-x-auto pb-1">
          <div className="flex flex-col gap-0.5 mr-1 shrink-0">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
              <div key={d} className="h-3 text-[9px] text-gray-400 dark:text-gray-500 flex items-center w-6">{d}</div>
            ))}
          </div>
          {Array.from({ length: 12 }, (_, week) => (
            <div key={week} className="flex flex-col gap-0.5 shrink-0">
              {Array.from({ length: 7 }, (_, day) => {
                const cell = activityCells[week * 7 + day];
                if (!cell) return <div key={day} className="w-3 h-3" />;
                return (
                  <div key={day} title={`${cell.date}: ${cell.count} catatan`}
                    className={`w-3 h-3 rounded-sm ${activityColor(cell.count)}`} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <span>Sedikit</span>
          {activityLegend.map((c) => <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />)}
          <span>Banyak</span>
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
              <div key={note.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  note.type === "daily"
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "bg-purple-50 dark:bg-purple-900/30"
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
