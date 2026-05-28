"use client";

import { useState } from "react";
import { Share2, Globe, Lock, Loader2, X } from "lucide-react";

interface Props {
  type: "daily" | "weekly";
  totalNotes: number;
  publicCount: number;
  onDone: () => void;
}

export default function ShareAllButton({ type, totalNotes, publicCount, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const bulkShare = async (isPublic: boolean) => {
    setLoading(true);
    try {
      await fetch("/api/notes/share-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, isPublic }),
      });
      onDone();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (totalNotes === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Bagikan semua catatan"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0 ${
          publicCount > 0
            ? "border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
            : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
        }`}
      >
        <Share2 className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Bagikan</span>
        {publicCount > 0 && (
          <span className="bg-green-600 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
            {publicCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Bagikan Semua Catatan</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
              <Globe className="w-3.5 h-3.5 shrink-0 text-green-600" />
              <span>
                <span className="font-semibold text-green-600 dark:text-green-400">{publicCount}</span>
                {" "}dari{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{totalNotes}</span>
                {" "}catatan sudah publik
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                disabled={loading || publicCount === totalNotes}
                onClick={() => bulkShare(true)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Jadikan semua publik
              </button>
              <button
                disabled={loading || publicCount === 0}
                onClick={() => bulkShare(false)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                Sembunyikan semua
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
