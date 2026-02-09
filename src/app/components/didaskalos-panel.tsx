import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, MessageCircle, ArrowRight, Plus, Pin, Edit2, Trash2, Minimize2, BookOpen, Layers, Languages, FileText, Library, AlertTriangle } from 'lucide-react';
import { notesService } from '@/services/notes.service';
import { api } from '@/lib/api';

interface Note {
  id: string;
  content: string;
  created_at?: string;
  pinned: boolean;
  context?: string;
  source: 'biblical-study' | 'textual-criticism' | 'exegesis' | 'homiletics' | 'curadoria' | 'general';
}

interface DidaskalosPanelProps {
  context?: string;
  suggestions?: string[];
  currentSource?: 'biblical-study' | 'textual-criticism' | 'exegesis' | 'homiletics' | 'curadoria' | 'general';
  studyContext?: {
    studySessionId: string;
    book: string;
    chapter: number;
    stage: string;
    notes?: unknown[];
    unresolvedQuestions?: string[];
    verses?: unknown[];
  };
}

const sourceConfig = {
  'biblical-study': { label: 'Biblical Study', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: BookOpen },
  'textual-criticism': { label: 'Textual Criticism', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Layers },
  exegesis: { label: 'Exegesis', color: 'bg-green-100 text-green-700 border-green-300', icon: Languages },
  homiletics: { label: 'Homiletics', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: FileText },
  curadoria: { label: 'Curadoria', color: 'bg-rose-100 text-rose-700 border-rose-300', icon: Library },
  general: { label: 'General', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: MessageCircle }
};

export function DidaskaloPanel({ context, suggestions, currentSource = 'general', studyContext }: DidaskalosPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [query, setQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');

  const storageKey = useMemo(() => `canon.notes.${currentSource}`, [currentSource]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const data = await notesService.list(currentSource);
        setNotes(data);
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) setNotes(JSON.parse(stored));
      }
    };
    loadNotes();
  }, [currentSource, storageKey]);

  const isOutOfMethod = studyContext?.stage === 'observation' && /sermon|application|prega/i.test(query);

  const handleAskDidaskalos = async () => {
    if (!query.trim() || !studyContext) return;
    try {
      const result = await api.post<{ answer: string; warning?: string }>('/api/didaskalos/query', {
        query,
        context: {
          studySessionId: studyContext.studySessionId,
          book: studyContext.book,
          chapter: studyContext.chapter,
          stage: studyContext.stage,
          notes: studyContext.notes,
          unresolvedQuestions: studyContext.unresolvedQuestions
        }
      });
      setAssistantResponse(result.warning ? `${result.warning}\n\n${result.answer}` : result.answer);
    } catch {
      setAssistantResponse('Didaskalos unavailable. Continue with text observation and grammar before application.');
    }
  };

  const displaySuggestions = suggestions || [
    'Observe repeated words in the verses',
    'Analyze grammar before theology',
    'List unresolved exegetical questions'
  ];

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent,
        pinned: false,
        context: context || 'General Note',
        source: currentSource,
        created_at: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      notesService.save(newNote).catch(() => undefined);
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  const handlePinNote = (id: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    notesService.remove(id).catch(() => undefined);
  };

  const formatTimestamp = (value?: string) => (value ? new Date(value).toLocaleString('pt-BR') : 'Agora');

  if (isMinimized) {
    return (
      <button onClick={() => setIsMinimized(false)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--deep-navy)] text-white shadow-lg">
        <MessageCircle size={24} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <div className="w-80 bg-[var(--ivory)] border-l border-[var(--divider)] flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--divider)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
            <h3 className="text-sm tracking-[0.1em] small-caps text-[var(--graphite)]">Didaskalos</h3>
          </div>
          <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-md hover:bg-[var(--light-gray)]"><Minimize2 size={14} /></button>
        </div>
        {studyContext && <p className="text-[11px] text-[var(--muted-foreground)]">Session: {studyContext.book} {studyContext.chapter} · {studyContext.stage}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isOutOfMethod && (
          <div className="p-3 border border-amber-300 bg-amber-50 rounded text-xs text-amber-800 flex gap-2">
            <AlertTriangle size={14} />
            Method warning: do not jump to application before interpretation.
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-xs tracking-wide small-caps text-[var(--muted-foreground)]">Suggested Steps</h4>
          <ul className="space-y-2">
            {displaySuggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-[var(--foreground)]">• {suggestion}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="w-full p-2 border rounded" placeholder="Ask Didaskalos with study context" />
          <button onClick={handleAskDidaskalos} disabled={!studyContext} className="px-3 py-2 rounded bg-[var(--deep-navy)] text-white disabled:opacity-50">Ask</button>
          {assistantResponse && <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap">{assistantResponse}</p>}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs tracking-wide small-caps text-[var(--muted-foreground)]">Notes</h4>
          <button onClick={() => setIsAddingNote(true)} className="text-xs px-2 py-1 border rounded">+ Add note</button>
          {isAddingNote && (
            <div className="space-y-2">
              <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} className="w-full p-2 border rounded" />
              <button onClick={handleAddNote} className="text-xs px-2 py-1 border rounded">Save</button>
            </div>
          )}
          {notes.map((note) => (
            <div key={note.id} className="p-3 border rounded bg-white">
              <p className="text-xs">{note.content}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{formatTimestamp(note.created_at)}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => handlePinNote(note.id)} className="text-[10px]">pin</button>
                <button onClick={() => handleDeleteNote(note.id)} className="text-[10px]">delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
