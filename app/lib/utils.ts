import { format, getWeek, getYear, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: string): string {
  return format(parseISO(date), "d MMMM yyyy", { locale: id });
}

export function formatDateTime(date: string): string {
  return format(parseISO(date), "d MMM yyyy, HH:mm", { locale: id });
}

export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: 1 });
}

export function getWeekRange(weekNum: number, year: number): string {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (weekNum - 1) * 7);
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
