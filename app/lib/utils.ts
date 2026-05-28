import { format, getWeek, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: string): string {
  return format(parseISO(date), "d MMMM yyyy", { locale: id });
}

export function formatDateTime(date: string): string {
  return format(parseISO(date), "d MMM yyyy, HH:mm", { locale: id });
}

const ISO_WEEK_OPTS = { weekStartsOn: 1, firstWeekContainsDate: 4 } as const;

export function getWeekNumber(date: Date): number {
  return getWeek(date, ISO_WEEK_OPTS);
}

export function getWeeksInYear(year: number): number {
  // Dec 28 is always in the last ISO week of its own year
  return getWeek(new Date(year, 11, 28), ISO_WEEK_OPTS);
}

export function getWeekStartDate(weekNum: number, year: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - dow + 1 + (weekNum - 1) * 7);
  return weekStart;
}

export function getWeekRange(weekNum: number, year: number): string {
  const weekStart = getWeekStartDate(weekNum, year);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return `${format(weekStart, "d MMM", { locale: id })} - ${format(weekEnd, "d MMM yyyy", { locale: id })}`;
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

export function stripMarkdown(text: string, maxLength = 80): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*+]\s+/gm, "· ")
    .replace(/^[ \t]*\d+\.\s+/gm, "· ")
    .replace(/\\(.)/g, "$1")
    .replace(/\*{3}([\s\S]+?)\*{3}/g, "$1")
    .replace(/_{3}([\s\S]+?)_{3}/g, "$1")
    .replace(/\*{2}([\s\S]+?)\*{2}/g, "$1")
    .replace(/_{2}([\s\S]+?)_{2}/g, "$1")
    .replace(/\*([\s\S]+?)\*/g, "$1")
    .replace(/_([\s\S]+?)_/g, "$1")
    .replace(/`[^`]+`/g, "")
    .replace(/^>\s*/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLength);
}
