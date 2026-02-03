import { useState } from 'react';
import { Lightbulb, MessageCircle, ArrowRight, Plus, Pin, Edit2, Trash2, Minimize2, Maximize2, BookOpen, Layers, Languages, FileText, Library } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  isPinned: boolean;
  context: string;
  source: 'biblical-study' | 'textual-criticism' | 'exegesis' | 'homiletics' | 'curadoria' | 'general';
}

interface DidaskalosPanelProps {
  context?: string;
  suggestions?: string[];
  currentSource?: 'biblical-study' | 'textual-criticism' | 'exegesis' | 'homiletics' | 'curadoria' | 'general';
}

const sourceConfig = {
  'biblical-study': {
    label: 'Biblical Study',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: BookOpen
  },
  'textual-criticism': {
    label: 'Textual Criticism',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: Layers
  },
  'exegesis': {
    label: 'Exegesis',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Languages
  },
  'homiletics': {
    label: 'Homiletics',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: FileText
  },
  'curadoria': {
    label: 'Curadoria',
    color: 'bg-rose-100 text-rose-700 border-rose-300',
    icon: Library
  },
  'general': {
    label: 'General',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: MessageCircle
  }
};

export function DidaskaloPanel({ context, suggestions, currentSource = 'general' }: DidaskalosPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Note on Paul\'s use of δικαιοσύνη in Romans 3:21-26',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isPinned: false,
      context: 'Romans 3:21-26',
      source: 'biblical-study'
    },
    {
      id: '2',
      content: 'Variant reading in John 1:18 - θεὸς vs υἱὸς. Lectio difficilior suggests θεὸς is original.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isPinned: true,
      context: 'John 1:18 - Textual Criticism',
      source: 'textual-criticism'
    }
  ]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const defaultSuggestions = [
    "Review cross-references in this passage",
    "Examine the original Greek text",
    "Consider the historical context",
  ];

  const displaySuggestions = suggestions || defaultSuggestions;

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        content: newNoteContent,
        timestamp: new Date(),
        isPinned: false,
        context: context || 'General Note',
        source: currentSource
      };
      setNotes([newNote, ...notes]);
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  const handlePinNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editingContent.trim()) {
      setNotes(notes.map(note =>
        note.id === editingNoteId ? { ...note, content: editingContent } : note
      ));
      setEditingNoteId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  // Minimized State - Floating Chat Icon
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--deep-navy)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center z-50"
      >
        <MessageCircle size={24} strokeWidth={1.5} />
        {notes.filter(n => n.isPinned).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--muted-bronze)] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
            {notes.filter(n => n.isPinned).length}
          </span>
        )}
      </button>
    );
  }

  // Full Panel State
  return (
    <div className="w-80 bg-[var(--ivory)] border-l border-[var(--divider)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--divider)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
            <h3 className="text-sm tracking-[0.1em] small-caps text-[var(--graphite)]">
              Didaskalos
            </h3>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-md hover:bg-[var(--light-gray)] transition-colors"
            title="Minimize panel"
          >
            <Minimize2 size={14} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Your scholarly guide and analytical companion
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Context Reminder */}
        {context && (
          <div className="space-y-2">
            <h4 className="text-xs tracking-wide small-caps text-[var(--muted-foreground)]">
              Current Context
            </h4>
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              {context}
            </p>
          </div>
        )}

        {/* Analytical Suggestions */}
        <div className="space-y-3">
          <h4 className="text-xs tracking-wide small-caps text-[var(--muted-foreground)]">
            Suggested Steps
          </h4>
          <ul className="space-y-2">
            {displaySuggestions.map((suggestion, index) => (
              <li key={index}>
                <button className="w-full text-left group flex items-start gap-2 p-3 rounded-md border border-[var(--divider)] bg-white hover:border-[var(--deep-navy)]/20 hover:bg-[var(--light-gray)] transition-all duration-200">
                  <Lightbulb size={14} className="mt-0.5 text-[var(--muted-bronze)] flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-xs leading-relaxed text-[var(--foreground)] flex-1">
                    {suggestion}
                  </span>
                  <ArrowRight size={12} className="mt-0.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes Section */}
        <div className="pt-4 border-t border-[var(--divider)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs tracking-wide small-caps text-[var(--muted-foreground)]">
              Notes ({notes.length})
            </h4>
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--deep-navy)] text-white hover:bg-[var(--deep-navy)]/90 transition-colors"
            >
              <Plus size={12} strokeWidth={2} />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          </div>

          {/* Add Note Form */}
          {isAddingNote && (
            <div className="mb-3 p-3 rounded-md bg-white border border-[var(--deep-navy)]/30">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note..."
                className="w-full px-2 py-2 text-xs leading-relaxed border border-[var(--divider)] rounded resize-none focus:outline-none focus:border-[var(--deep-navy)]/30"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-[var(--deep-navy)] text-white rounded hover:bg-[var(--deep-navy)]/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNoteContent('');
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-[var(--light-gray)] text-[var(--foreground)] rounded hover:bg-[var(--light-gray)]/70 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-2">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-md border transition-all ${
                  note.isPinned
                    ? 'bg-[var(--subtle-gold)]/10 border-[var(--subtle-gold)]/30'
                    : 'bg-white border-[var(--divider)]'
                }`}
              >
                {editingNoteId === note.id ? (
                  <div>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-2 py-2 text-xs leading-relaxed border border-[var(--divider)] rounded resize-none focus:outline-none focus:border-[var(--deep-navy)]/30"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-2 py-1 text-[10px] font-medium bg-[var(--deep-navy)] text-white rounded hover:bg-[var(--deep-navy)]/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-2 py-1 text-[10px] font-medium bg-[var(--light-gray)] text-[var(--foreground)] rounded hover:bg-[var(--light-gray)]/70"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {formatTimestamp(note.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePinNote(note.id)}
                          className={`p-1 rounded transition-colors ${
                            note.isPinned
                              ? 'text-[var(--subtle-gold)]'
                              : 'text-[var(--muted-foreground)] hover:text-[var(--subtle-gold)]'
                          }`}
                          title={note.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin size={12} strokeWidth={1.5} fill={note.isPinned ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--deep-navy)] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={12} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Source Tag */}
                    <div className="mb-2">
                      {(() => {
                        const SourceIcon = sourceConfig[note.source].icon;
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${sourceConfig[note.source].color}`}>
                            <SourceIcon size={10} strokeWidth={2} />
                            <span>{sourceConfig[note.source].label}</span>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <p className="text-xs leading-relaxed text-[var(--foreground)] mb-2">
                      {note.content}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] italic">
                      {note.context}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}