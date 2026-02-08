import { useMemo, useState } from 'react';
import { DidaskaloPanel } from '@/app/components/didaskalos-panel';
import { Highlighter, Save } from 'lucide-react';
import { useStudySession } from '@/app/study-session-context';

const books = ['Genesis', 'Exodus', 'Psalms', 'Matthew', 'John', 'Romans'];
const stages = ['observation', 'grammar', 'semantics', 'theology', 'canonical-correlation', 'homiletics'] as const;

export function BiblicalStudy() {
  const { session, loading, setReference, addHighlight, setStage } = useStudySession();
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const context = useMemo(() => {
    if (!session) return 'Loading study session...';
    return `${session.book} ${session.chapter} (${session.translation}) · Stage: ${session.stage}`;
  }, [session]);

  if (loading || !session) {
    return <div className="flex-1 p-10">Loading study session...</div>;
  }

  const handleHighlight = async () => {
    if (!selectedVerse) return;
    const verse = session.verses.find((item) => item.number === selectedVerse);
    if (!verse) return;
    await addHighlight({
      id: `hl-${Date.now()}`,
      verse: verse.number,
      text: verse.text,
      color: 'yellow'
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="px-10 py-6 border-b border-[var(--divider)]">
          <h1 className="text-2xl tracking-tight text-[var(--graphite)] mb-2">Biblical Study & Exegesis</h1>
          <p className="text-xs text-[var(--muted-foreground)] small-caps tracking-wide">The biblical text governs the method</p>
        </div>

        <div className="px-10 py-4 border-b border-[var(--divider)] bg-[var(--ivory)]/30 flex items-center gap-3 flex-wrap">
          <select
            value={session.translation}
            onChange={(e) => setReference(e.target.value as 'ACF' | 'ARA', session.book, session.chapter)}
            className="px-3 py-2 rounded border border-[var(--divider)] bg-white"
          >
            <option value="ACF">ACF</option>
            <option value="ARA">ARA</option>
          </select>
          <select
            value={session.book}
            onChange={(e) => setReference(session.translation, e.target.value, 1)}
            className="px-3 py-2 rounded border border-[var(--divider)] bg-white"
          >
            {books.map((book) => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={session.chapter}
            onChange={(e) => setReference(session.translation, session.book, Number(e.target.value || 1))}
            className="w-24 px-3 py-2 rounded border border-[var(--divider)] bg-white"
          />
          <div className="ml-auto flex items-center gap-2">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setStage(stage)}
                className={`px-2 py-1 rounded text-xs border ${session.stage === stage ? 'bg-[var(--deep-navy)] text-white' : 'bg-white border-[var(--divider)]'}`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-3">
          {session.verses.map((verse) => (
            <button
              key={verse.number}
              onClick={() => setSelectedVerse(verse.number)}
              className={`w-full text-left p-4 rounded border ${selectedVerse === verse.number ? 'border-[var(--deep-navy)] bg-[var(--subtle-gold)]/20' : 'border-[var(--divider)] bg-[var(--ivory)]'}`}
            >
              <span className="font-medium text-[var(--deep-navy)] mr-2">{verse.number}</span>
              <span className="font-serif-reading">{verse.text}</span>
            </button>
          ))}
        </div>

        <div className="px-10 py-4 border-t border-[var(--divider)] flex items-center gap-3">
          <button
            onClick={handleHighlight}
            disabled={!selectedVerse}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--deep-navy)] text-white disabled:opacity-50"
          >
            <Highlighter size={16} />
            Highlight selected verse
          </button>
          <span className="text-xs text-[var(--muted-foreground)]">
            {session.highlights.length} highlights saved in this StudySession
          </span>
          <Save size={16} className="text-[var(--muted-foreground)]" />
        </div>
      </div>

      <DidaskaloPanel
        currentSource="biblical-study"
        context={context}
        studyContext={{
          studySessionId: session.id,
          book: session.book,
          chapter: session.chapter,
          stage: session.stage,
          notes: session.notes,
          unresolvedQuestions: session.unresolvedQuestions,
          verses: session.verses
        }}
      />
    </div>
  );
}
