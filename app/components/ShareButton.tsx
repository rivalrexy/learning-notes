"use client";

import { useState } from "react";
import { Share2, Copy, Check, X, Globe, Lock, Loader2 } from "lucide-react";

interface Props {
  noteId: string;
  isPublic: boolean;
  token: string | null;
  onToggle: (isPublic: boolean, token: string | null) => void;
}

export default function ShareButton({ noteId, isPublic, token, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`
    : null;

  const toggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onToggle(data.isPublic, data.shareToken ?? null);
      }
    } finally {
      setToggling(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title={isPublic ? "Catatan dibagikan — klik untuk ubah" : "Bagikan catatan"}
        className={`p-1.5 rounded-lg transition-colors ${
          isPublic
            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40"
            : "text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
        }`}
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-72">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Bagikan Catatan</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Toggle row */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
              <div className="flex items-center gap-2">
                {isPublic
                  ? <Globe className="w-4 h-4 text-green-600 shrink-0" />
                  : <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />}
                <div>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {isPublic ? "Link aktif" : "Tidak dibagikan"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {isPublic ? "Siapa pun bisa melihat" : "Hanya kamu yang bisa melihat"}
                  </p>
                </div>
              </div>

              <button
                onClick={toggle}
                disabled={toggling}
                className={`relative w-10 h-6 rounded-full transition-colors disabled:opacity-50 shrink-0 ${
                  isPublic ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                {toggling ? (
                  <Loader2 className="w-3 h-3 animate-spin absolute inset-0 m-auto text-white" />
                ) : (
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isPublic ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                )}
              </button>
            </div>

            {/* Share URL */}
            {isPublic && shareUrl && (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 truncate focus:outline-none"
                />
                <button
                  onClick={copy}
                  title={copied ? "Tersalin!" : "Salin link"}
                  className={`shrink-0 px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
