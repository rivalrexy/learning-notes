"use client";

import { Bold, Italic, Hash, List, ListOrdered, Quote, Code, Minus } from "lucide-react";

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

type WrapTool = { kind: "wrap"; icon: React.ReactNode; title: string; syntax: string };
type PrefixTool = { kind: "prefix"; icon: React.ReactNode; title: string; syntax: string };
type SepTool = { kind: "sep" };
type Tool = WrapTool | PrefixTool | SepTool;

const tools: Tool[] = [
  { kind: "wrap",   icon: <Bold className="w-3.5 h-3.5" />,        title: "Bold (Ctrl+B)",   syntax: "**" },
  { kind: "wrap",   icon: <Italic className="w-3.5 h-3.5" />,      title: "Italic (Ctrl+I)", syntax: "*" },
  { kind: "sep" },
  { kind: "prefix", icon: <Hash className="w-3.5 h-3.5" />,        title: "Heading",         syntax: "## " },
  { kind: "prefix", icon: <List className="w-3.5 h-3.5" />,        title: "Bullet list",     syntax: "- " },
  { kind: "prefix", icon: <ListOrdered className="w-3.5 h-3.5" />, title: "Numbered list",   syntax: "1. " },
  { kind: "sep" },
  { kind: "prefix", icon: <Quote className="w-3.5 h-3.5" />,       title: "Blockquote",      syntax: "> " },
  { kind: "wrap",   icon: <Code className="w-3.5 h-3.5" />,        title: "Inline code",     syntax: "`" },
  { kind: "prefix", icon: <Minus className="w-3.5 h-3.5" />,       title: "Horizontal rule", syntax: "---\n" },
];

export default function MarkdownToolbar({ textareaRef, value, onChange }: Props) {
  const apply = (tool: WrapTool | PrefixTool) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    let newValue: string;
    let nextStart: number;
    let nextEnd: number;

    if (tool.kind === "wrap") {
      const selected = value.slice(start, end);
      newValue =
        value.slice(0, start) + tool.syntax + selected + tool.syntax + value.slice(end);
      nextStart = start + tool.syntax.length;
      nextEnd = end + tool.syntax.length;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      newValue = value.slice(0, lineStart) + tool.syntax + value.slice(lineStart);
      nextStart = start + tool.syntax.length;
      nextEnd = nextStart;
    }

    onChange(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(nextStart, nextEnd);
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }, 0);
  };

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-t-lg border-b-0">
      {tools.map((tool, i) => {
        if (tool.kind === "sep") {
          return <div key={i} className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />;
        }
        return (
          <button
            key={i}
            type="button"
            title={tool.title}
            onMouseDown={(e) => {
              e.preventDefault();
              apply(tool);
            }}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
}
