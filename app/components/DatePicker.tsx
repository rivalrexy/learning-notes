"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
}

export default function DatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() =>
    value ? new Date(value + "T00:00:00") : new Date()
  );
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = view.getFullYear();
  const month = view.getMonth();

  // Monday-based padding
  const firstOfMonth = new Date(year, month, 1);
  let startPad = firstOfMonth.getDay();
  startPad = startPad === 0 ? 6 : startPad - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function openPicker() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function selectDay(day: Date) {
    const iso = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");
    onChange(iso);
    setOpen(false);
  }

  const displayValue = selected
    ? format(selected, "EEEE, d MMMM yyyy", { locale: id })
    : "Pilih tanggal";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 w-full"
      >
        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="capitalize truncate">{displayValue}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 w-72"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
                {format(view, "MMMM yyyy", { locale: id })}
              </span>
              <button
                type="button"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 pb-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const isSel = selected?.toDateString() === day.toDateString();
                const isToday = today.toDateString() === day.toDateString();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={[
                      "w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors",
                      isSel
                        ? "bg-indigo-600 text-white"
                        : isToday
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Today shortcut */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <button
                type="button"
                onClick={() => selectDay(new Date())}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Hari ini
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
