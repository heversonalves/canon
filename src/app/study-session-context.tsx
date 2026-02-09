import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { bibleService } from '@/services/bible.service';
import { studySessionService, type Highlight, type Note, type StudySession, type StudyStage, type Verse } from '@/services/studySession.service';

const STAGES: StudyStage[] = ['observation', 'grammar', 'semantics', 'theology', 'canonical-correlation', 'homiletics'];

interface StudySessionContextValue {
  session: StudySession | null;
  loading: boolean;
  setReference: (translation: 'ACF' | 'ARA', book: string, chapter: number) => Promise<void>;
  setStage: (stage: StudyStage) => Promise<void>;
  addHighlight: (highlight: Highlight) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  loadLastSession: () => Promise<void>;
  canAccessStage: (stage: StudyStage) => boolean;
}

const StudySessionContext = createContext<StudySessionContextValue | undefined>(undefined);

const createDefaultSession = (): StudySession => ({
  id: `session-${Date.now()}`,
  translation: 'ACF',
  book: 'Romans',
  chapter: 3,
  stage: 'observation',
  verses: [],
  notes: [],
  highlights: [],
  unresolvedQuestions: [],
  lastAccessed: new Date().toISOString()
});

export function StudySessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = async (next: StudySession) => {
    const payload = { ...next, lastAccessed: new Date().toISOString() };
    const saved = await studySessionService.createOrUpdate(payload);
    setSession(saved);
  };

  const hydrateVerses = async (base: StudySession) => {
    const verses = await bibleService.getChapter(base.translation, base.book, base.chapter);
    return { ...base, verses };
  };

  const loadLastSession = async () => {
    try {
      const last = await studySessionService.getLast();
      const withVerses = await hydrateVerses(last);
      setSession(withVerses);
    } catch {
      const fallback = await hydrateVerses(createDefaultSession());
      await persist(fallback);
    }
  };

  useEffect(() => {
    loadLastSession().finally(() => setLoading(false));
  }, []);

  const setReference = async (translation: 'ACF' | 'ARA', book: string, chapter: number) => {
    const base = session ?? createDefaultSession();
    const next = await hydrateVerses({ ...base, translation, book, chapter });
    await persist(next);
  };

  const setStage = async (stage: StudyStage) => {
    if (!session) return;
    await persist({ ...session, stage });
  };

  const addHighlight = async (highlight: Highlight) => {
    if (!session) return;
    await persist({ ...session, highlights: [highlight, ...session.highlights] });
  };

  const addNote = async (note: Note) => {
    if (!session) return;
    await persist({ ...session, notes: [note, ...session.notes] });
  };

  const canAccessStage = (stage: StudyStage) => {
    if (!session) return false;
    return STAGES.indexOf(stage) <= STAGES.indexOf(session.stage);
  };

  const value = useMemo(
    () => ({ session, loading, setReference, setStage, addHighlight, addNote, loadLastSession, canAccessStage }),
    [session, loading]
  );

  return <StudySessionContext.Provider value={value}>{children}</StudySessionContext.Provider>;
}

export const useStudySession = () => {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error('useStudySession must be used within StudySessionProvider');
  }
  return context;
};
