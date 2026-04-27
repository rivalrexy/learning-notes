import { LearningNote, LearningSource } from "@/app/types";

const NOTES_KEY = "learning_notes";
const SOURCES_KEY = "learning_sources";

export function getNotes(): LearningNote[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveNote(note: LearningNote): void {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) {
    notes[idx] = note;
  } else {
    notes.push(note);
  }
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function getSources(): LearningSource[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SOURCES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSource(source: LearningSource): void {
  const sources = getSources();
  const idx = sources.findIndex((s) => s.id === source.id);
  if (idx >= 0) {
    sources[idx] = source;
  } else {
    sources.push(source);
  }
  localStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
}

export function deleteSource(id: string): void {
  const sources = getSources().filter((s) => s.id !== id);
  localStorage.setItem(SOURCES_KEY, JSON.stringify(sources));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
