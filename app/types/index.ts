export type NoteType = "daily" | "weekly";

export type SourceType = "youtube" | "book" | "article" | "other";

export interface LearningSource {
  id: string;
  type: SourceType;
  title: string;
  author?: string;
  url?: string;
  description?: string;
  createdAt: string;
}

export interface LearningNote {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  date: string;
  weekNumber?: number;
  year?: number;
  tags: string[];
  category: string;
  sources: string[];
  createdAt: string;
  updatedAt: string;
}
