import { api } from '@/lib/api';

export type StudyStage =
  | 'observation'
  | 'grammar'
  | 'semantics'
  | 'theology'
  | 'canonical-correlation'
  | 'homiletics';

export interface Verse {
  number: number;
  text: string;
}

export interface Note {
  id: string;
  source: string;
  content: string;
  context?: string;
  pinned: boolean;
  created_at?: string;
}

export interface Highlight {
  id: string;
  verse: number;
  text: string;
  color: string;
}

export interface StudySession {
  id: string;
  translation: 'ACF' | 'ARA';
  book: string;
  chapter: number;
  verseRange?: string;
  stage: StudyStage;
  verses: Verse[];
  notes: Note[];
  highlights: Highlight[];
  unresolvedQuestions: string[];
  lastAccessed: string;
}

export const studySessionService = {
  getLast: () => api.get<StudySession>('/api/study-sessions/last'),
  getById: (id: string) => api.get<StudySession>(`/api/study-sessions/${id}`),
  createOrUpdate: (payload: StudySession) => api.put<StudySession>(`/api/study-sessions/${payload.id}`, payload)
};
