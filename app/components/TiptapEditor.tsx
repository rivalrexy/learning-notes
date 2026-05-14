"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Bold, Italic, Hash, List, ListOrdered, Quote, Code, Minus, ListIndentIncrease, ListIndentDecrease } from "lucide-react";
import EmojiPicker from "@/app/components/EmojiPicker";

interface Props {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({ html: false, tightLists: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "Tuliskan apa yang kamu pelajari...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown;
      onChange(md.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-40 px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none dark:text-gray-200",
      },
    },
  });

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(name, attrs) ?? false;

  const toolBtn = (active: boolean) =>
    `p-1.5 rounded-md transition-colors ${
      active
        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-gray-600"
    }`;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }} className={toolBtn(isActive("bold"))}>
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }} className={toolBtn(isActive("italic"))}>
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
        <button type="button" title="Heading" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 2 }).run(); }} className={toolBtn(isActive("heading", { level: 2 }))}>
          <Hash className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBulletList().run(); }} className={toolBtn(isActive("bulletList"))}>
          <List className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Numbered list" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleOrderedList().run(); }} className={toolBtn(isActive("orderedList"))}>
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Indent (Tab)" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().sinkListItem("listItem").run(); }} className={toolBtn(false)}>
          <ListIndentIncrease className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Outdent (Shift+Tab)" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().liftListItem("listItem").run(); }} className={toolBtn(false)}>
          <ListIndentDecrease className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
        <button type="button" title="Blockquote" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBlockquote().run(); }} className={toolBtn(isActive("blockquote"))}>
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Inline code" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleCode().run(); }} className={toolBtn(isActive("code"))}>
          <Code className="w-3.5 h-3.5" />
        </button>
        <button type="button" title="Divider" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setHorizontalRule().run(); }} className={toolBtn(false)}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
        <EmojiPicker
          onSelect={(emoji) => editor?.chain().focus().insertContent(emoji).run()}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors"
        />
      </div>

      {/* Editable content */}
      <div className="
        bg-white dark:bg-gray-700
        [&_.ProseMirror]:focus:outline-none
        [&_.ProseMirror_p]:my-1
        [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-3 [&_.ProseMirror_h1]:mb-1
        [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-2 [&_.ProseMirror_h2]:mb-1
        [&_.ProseMirror_h3]:text-sm [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-1.5
        [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5
        [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5
        [&_.ProseMirror_li]:my-0.5
        [&_.ProseMirror_ul_ul]:list-[circle] [&_.ProseMirror_ul_ul]:pl-5 [&_.ProseMirror_ul_ul]:mt-0.5
        [&_.ProseMirror_ul_ul_ul]:list-[square] [&_.ProseMirror_ul_ul_ul]:pl-5 [&_.ProseMirror_ul_ul_ul]:mt-0.5
        [&_.ProseMirror_ol_ol]:list-[lower-alpha] [&_.ProseMirror_ol_ol]:pl-5 [&_.ProseMirror_ol_ol]:mt-0.5
        [&_.ProseMirror_ol_ol_ol]:list-[lower-roman] [&_.ProseMirror_ol_ol_ol]:pl-5 [&_.ProseMirror_ol_ol_ol]:mt-0.5
        [&_.ProseMirror_li_p]:my-0
        [&_.ProseMirror_code]:bg-gray-100 dark:[&_.ProseMirror_code]:bg-gray-600 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-[0.85em] [&_.ProseMirror_code]:font-mono
        [&_.ProseMirror_pre]:bg-gray-900 [&_.ProseMirror_pre]:text-gray-100 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:my-2 [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:overflow-x-auto
        [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:text-inherit [&_.ProseMirror_pre_code]:p-0
        [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-indigo-300 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-gray-500 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-2
        [&_.ProseMirror_hr]:border-gray-200 dark:[&_.ProseMirror_hr]:border-gray-600 [&_.ProseMirror_hr]:my-2
        [&_.ProseMirror_strong]:font-semibold
        [&_.ProseMirror_em]:italic
      ">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
