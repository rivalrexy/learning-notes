export const CATEGORIES = [
  "Relationship",
  "Agama",
  "Keuangan",
  "Lainnya",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLOR: Record<string, { bg: string; text: string }> = {
  "Relationship": { bg: "bg-rose-100 dark:bg-rose-900/30",   text: "text-rose-700 dark:text-rose-300" },
  "Agama":        { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  "Keuangan":     { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  "Lainnya":      { bg: "bg-gray-100 dark:bg-gray-700",      text: "text-gray-600 dark:text-gray-400" },
};

export function suggestCategory(title: string, content: string, tags: string[]): string {
  const text = [title, content, ...tags].join(" ").toLowerCase();
  if (/\b(pasangan|hubungan|relationship|cinta|sayang|komunikasi|konflik|pernikahan|nikah|tunangan|lamaran|pacaran|kangen|rindu|date|anniversary|romant|couple|bucin)\b/.test(text))
    return "Relationship";
  if (/\b(doa|ibadah|agama|iman|quran|sholat|shalat|gereja|tuhan|allah|rohani|alkitab|renungan|syukur|tarawih|puasa|zakat|sedekah|akhirat|surga|dzikir|istighfar)\b/.test(text))
    return "Agama";
  if (/\b(uang|tabungan|investasi|budget|keuangan|pengeluaran|pendapatan|cicilan|hutang|dana|rekening|asuransi|nabung|belanja|hemat|gaji|bisnis|modal|untung|rugi|saham)\b/.test(text))
    return "Keuangan";
  return "Lainnya";
}
