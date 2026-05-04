"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

const EMOJIS = [
  "😀","😂","🥹","😍","🤩","🥳","😎","🤔","😅","🙂",
  "💡","🧠","🎯","🔥","⭐","✨","💎","🏆","🎉","🎊",
  "📝","✏️","📚","📖","📓","🎓","📌","📋","📊","📈",
  "💪","👍","🙏","❤️","💙","💚","💜","🤝","💯","✅",
  "🚀","💫","🌟","☀️","🌙","⚡","🌈","🌱","🔬","🔑",
  "🎵","🎨","📅","⏰","💭","💬","🗂️","🔔","📣","🎯",
];

interface Props {
  onSelect: (emoji: string) => void;
  className?: string;
}

export default function EmojiPicker({ onSelect, className }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-emoji-picker]") && !t.closest("[data-emoji-trigger]")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const pickerH = 220;
      const pickerW = 264;
      const top =
        rect.bottom + pickerH > window.innerHeight
          ? rect.top - pickerH - 4
          : rect.bottom + 4;
      const left = Math.max(4, Math.min(rect.left, window.innerWidth - pickerW - 8));
      setPos({ top, left });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        data-emoji-trigger
        type="button"
        title="Tambah emoji"
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggle}
        className={
          className ??
          "p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
        }
      >
        <Smile className="w-4 h-4" />
      </button>

      {open && (
        <div
          data-emoji-picker
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2.5"
          style={{ top: pos.top, left: pos.left, width: pickerW }}
        >
          <div className="grid grid-cols-10 gap-0.5 max-h-48 overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-7 h-7 flex items-center justify-center transition-colors leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const pickerW = 264;
