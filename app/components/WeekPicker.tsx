"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { getWeeksInYear, getWeekRange } from "@/app/lib/utils";

interface Props {
  weekNum: number;
  weekYear: number;
  onChange: (weekNum: number, year: number) => void;
}

export default function WeekPicker({ weekNum, weekYear, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(weekYear);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const totalWeeks = getWeeksInYear(viewYear);
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  function openPicker() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 6, left: rect.left });
    }
    setViewYear(weekYear);
    setOpen(true);
  }

  useEffect(() => {
    if (open && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function selectWeek(wn: number, yr: number) {
    onChange(wn, yr);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white w-full"
      >
        <CalendarDays className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="font-medium">Pekan {weekNum}</span>
        <span className="text-gray-400 text-xs truncate">· {getWeekRange(weekNum, weekYear)}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl w-72 overflow-hidden"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            {/* Year navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setViewYear((y) => y - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800">{viewYear}</span>
              <button
                type="button"
                onClick={() => setViewYear((y) => y + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {weeks.map((wn) => {
                const isSel = wn === weekNum && viewYear === weekYear;
                return (
                  <button
                    key={wn}
                    ref={isSel ? selectedRef : undefined}
                    type="button"
                    onClick={() => selectWeek(wn, viewYear)}
                    className={[
                      "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                      isSel
                        ? "bg-purple-600 text-white"
                        : "text-gray-700 hover:bg-purple-50",
                    ].join(" ")}
                  >
                    <span className="font-semibold">Pekan {wn}</span>
                    <span
                      className={isSel ? "text-purple-200" : "text-gray-400"}
                      style={{ fontSize: "11px" }}
                    >
                      {getWeekRange(wn, viewYear)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
