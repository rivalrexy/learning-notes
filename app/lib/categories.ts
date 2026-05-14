export const CATEGORIES = [
  "Keuangan",
  "Komunikasi",
  "Pertumbuhan Diri",
  "Rencana Bersama",
  "Kesehatan",
  "Spiritual",
  "Karier",
  "Hobi & Kreasi",
  "Lainnya",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLOR: Record<string, { bg: string; text: string }> = {
  "Keuangan":        { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-300" },
  "Komunikasi":      { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-300" },
  "Pertumbuhan Diri":{ bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  "Rencana Bersama": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
  "Kesehatan":       { bg: "bg-rose-100 dark:bg-rose-900/30",     text: "text-rose-700 dark:text-rose-300" },
  "Spiritual":       { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-300" },
  "Karier":          { bg: "bg-teal-100 dark:bg-teal-900/30",     text: "text-teal-700 dark:text-teal-300" },
  "Hobi & Kreasi":   { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  "Lainnya":         { bg: "bg-gray-100 dark:bg-gray-700",        text: "text-gray-600 dark:text-gray-400" },
};

export function suggestCategory(title: string, content: string, tags: string[]): string {
  const text = [title, content, ...tags].join(" ").toLowerCase();
  if (/\b(uang|tabungan|investasi|budget|keuangan|pengeluaran|pendapatan|cicilan|hutang|dana|rekening|asuransi|nabung|belanja|hemat)\b/.test(text))
    return "Keuangan";
  if (/\b(komunikasi|bicara|diskusi|cerita|konflik|perselisihan|mendengar|ekspresi|perasaan|curhat|ngobrol|argumen|pendapat)\b/.test(text))
    return "Komunikasi";
  if (/\b(belajar|pengembangan|skill|kemampuan|kebiasaan|mindset|motivasi|produktif|target|tujuan|diri|potensi|refleksi|jurnal)\b/.test(text))
    return "Pertumbuhan Diri";
  if (/\b(rencana|plan|masa depan|impian|nikah|pernikahan|rumah|liburan|cita|wisata|trip|wedding|tunangan|lamaran)\b/.test(text))
    return "Rencana Bersama";
  if (/\b(kesehatan|olahraga|diet|makanan|tidur|mental|stres|meditasi|yoga|tubuh|sehat|sakit|vitamin|nutrisi)\b/.test(text))
    return "Kesehatan";
  if (/\b(doa|ibadah|spiritual|iman|agama|renungan|syukur|quran|alkitab|sholat|gereja|tuhan|rohani|faith)\b/.test(text))
    return "Spiritual";
  if (/\b(kerja|karier|kantor|promosi|bisnis|usaha|pekerjaan|gaji|interview|jabatan|proyek|client|perusahaan)\b/.test(text))
    return "Karier";
  if (/\b(hobi|seni|musik|memasak|foto|film|buku|kreatif|lukis|nyanyi|main|game|craft|desain|vlog|konten)\b/.test(text))
    return "Hobi & Kreasi";
  return "Lainnya";
}
