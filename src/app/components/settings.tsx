import { useEffect, useState } from 'react';
import { Upload, FileText, Check, X, BookOpen, BookMarked, Book } from 'lucide-react';
import {
  BibleTranslation,
  loadBibleTranslations,
  parseBibleJson,
  saveBibleTranslations
} from '@/app/lib/bible-data';

interface UploadedLexicon {
  id: string;
  name: string;
  language: 'greek' | 'hebrew';
  uploadDate: string;
  fileSize: string;
}

interface UploadedCommentary {
  id: string;
  name: string;
  author: string;
  uploadDate: string;
  fileSize: string;
}

export function Settings() {
  const [bibleTranslations, setBibleTranslations] = useState<BibleTranslation[]>([]);
  const [uploadedLexicons, setUploadedLexicons] = useState<UploadedLexicon[]>([]);

  const [uploadedCommentaries, setUploadedCommentaries] = useState<UploadedCommentary[]>([]);

  const handleLexiconUpload = (language: 'greek' | 'hebrew') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const newLexicon: UploadedLexicon = {
      id: `${language}-${Date.now()}`,
      name: file.name,
      language,
      uploadDate: new Date().toISOString(),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };
    const next = [newLexicon, ...uploadedLexicons];
    setUploadedLexicons(next);
    window.localStorage.setItem('canon.lexicons', JSON.stringify(next));
    event.target.value = '';
  };

  const handleBibleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = parseBibleJson(JSON.parse(text));
      if (!parsed) {
        event.target.value = '';
        return;
      }
      const next = [parsed, ...bibleTranslations];
      setBibleTranslations(next);
      saveBibleTranslations(next);
    } catch {
      // ignore invalid JSON
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveBibleTranslation = (id: string) => {
    const next = bibleTranslations.filter((translation) => translation.id !== id);
    setBibleTranslations(next);
    saveBibleTranslations(next);
  };

  const handleCommentaryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const newCommentary: UploadedCommentary = {
      id: `commentary-${Date.now()}`,
      name: file.name,
      author: 'Unknown',
      uploadDate: new Date().toISOString(),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };
    const next = [newCommentary, ...uploadedCommentaries];
    setUploadedCommentaries(next);
    window.localStorage.setItem('canon.commentaries', JSON.stringify(next));
    event.target.value = '';
  };

  const handleRemoveLexicon = (id: string) => {
    setUploadedLexicons(uploadedLexicons.filter(lex => lex.id !== id));
  };

  const handleRemoveCommentary = (id: string) => {
    setUploadedCommentaries(uploadedCommentaries.filter(comm => comm.id !== id));
  };

  useEffect(() => {
    setBibleTranslations(loadBibleTranslations());
    const storedLexicons = window.localStorage.getItem('canon.lexicons');
    const storedCommentaries = window.localStorage.getItem('canon.commentaries');
    if (storedLexicons) {
      setUploadedLexicons(JSON.parse(storedLexicons));
    }
    if (storedCommentaries) {
      setUploadedCommentaries(JSON.parse(storedCommentaries));
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-12 py-8 border-b border-[var(--divider)]">
        <h1 className="text-3xl tracking-tight text-[var(--graphite)] mb-2">
          Settings
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Configure your exegetical tools and lexicon resources
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-12 py-8">
        <div className="max-w-4xl space-y-8">
          {/* Lexicons Section */}
          <div>
            <h2 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-4">
              Lexicon Management
            </h2>
            
            <div className="space-y-6">
              {/* Greek Lexicons */}
              <div className="p-6 rounded-lg border border-[var(--divider)] bg-[var(--ivory)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-1">
                      Greek Lexicons
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Upload Greek lexicon databases for New Testament exegesis
                    </p>
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-[var(--deep-navy)] text-white rounded-md hover:bg-[var(--deep-navy)]/90 transition-colors cursor-pointer">
                    <Upload size={16} strokeWidth={1.5} />
                    <span className="text-sm">Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLexiconUpload('greek')}
                    />
                  </label>
                </div>

                {/* Uploaded Greek Lexicons */}
                <div className="space-y-2">
                  {uploadedLexicons
                    .filter(lex => lex.language === 'greek')
                    .map(lexicon => (
                      <div
                        key={lexicon.id}
                        className="flex items-center justify-between p-4 bg-white rounded-md border border-[var(--divider)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[var(--deep-navy)]/10 flex items-center justify-center">
                            <BookOpen size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[var(--foreground)]">
                              {lexicon.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                              <span>{lexicon.fileSize}</span>
                              <span>•</span>
                              <span>Uploaded {new Date(lexicon.uploadDate).toLocaleDateString('en-US')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                            <Check size={12} strokeWidth={2} />
                            <span>Active</span>
                          </div>
                          <button
                            onClick={() => handleRemoveLexicon(lexicon.id)}
                            className="p-2 rounded-md hover:bg-[var(--light-gray)] transition-colors"
                          >
                            <X size={16} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Supported Formats */}
                <div className="mt-4 p-3 rounded-md bg-[var(--light-gray)]/50">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <strong>Supported formats:</strong> BDAG, Thayer's, Louw-Nida, LSJ, Moulton-Milligan
                  </p>
                </div>
              </div>

              {/* Hebrew Lexicons */}
              <div className="p-6 rounded-lg border border-[var(--divider)] bg-[var(--ivory)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-1">
                      Hebrew Lexicons
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Upload Hebrew lexicon databases for Old Testament exegesis
                    </p>
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-[var(--deep-navy)] text-white rounded-md hover:bg-[var(--deep-navy)]/90 transition-colors cursor-pointer">
                    <Upload size={16} strokeWidth={1.5} />
                    <span className="text-sm">Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLexiconUpload('hebrew')}
                    />
                  </label>
                </div>

                {/* Uploaded Hebrew Lexicons */}
                <div className="space-y-2">
                  {uploadedLexicons
                    .filter(lex => lex.language === 'hebrew')
                    .map(lexicon => (
                      <div
                        key={lexicon.id}
                        className="flex items-center justify-between p-4 bg-white rounded-md border border-[var(--divider)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[var(--muted-bronze)]/10 flex items-center justify-center">
                            <BookOpen size={18} className="text-[var(--muted-bronze)]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[var(--foreground)]">
                              {lexicon.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                              <span>{lexicon.fileSize}</span>
                              <span>•</span>
                              <span>Uploaded {new Date(lexicon.uploadDate).toLocaleDateString('en-US')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                            <Check size={12} strokeWidth={2} />
                            <span>Active</span>
                          </div>
                          <button
                            onClick={() => handleRemoveLexicon(lexicon.id)}
                            className="p-2 rounded-md hover:bg-[var(--light-gray)] transition-colors"
                          >
                            <X size={16} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Supported Formats */}
                <div className="mt-4 p-3 rounded-md bg-[var(--light-gray)]/50">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <strong>Supported formats:</strong> HALOT, BDB, TWOT, DCH, Gesenius
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaries Section */}
          <div>
            <h2 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-4">
              Commentary Management
            </h2>
            
            <div className="space-y-6">
              {/* Biblical Commentaries */}
              <div className="p-6 rounded-lg border border-[var(--divider)] bg-[var(--ivory)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-1">
                      Biblical Commentaries
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Upload biblical commentary databases for exegetical analysis
                    </p>
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-[var(--deep-navy)] text-white rounded-md hover:bg-[var(--deep-navy)]/90 transition-colors cursor-pointer">
                    <Upload size={16} strokeWidth={1.5} />
                    <span className="text-sm">Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleCommentaryUpload}
                    />
                  </label>
                </div>

                {/* Uploaded Biblical Commentaries */}
                <div className="space-y-2">
                  {uploadedCommentaries.map(commentary => (
                    <div
                      key={commentary.id}
                      className="flex items-center justify-between p-4 bg-white rounded-md border border-[var(--divider)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[var(--deep-navy)]/10 flex items-center justify-center">
                          <BookMarked size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--foreground)]">
                            {commentary.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                            <span>{commentary.fileSize}</span>
                            <span>•</span>
                            <span>Uploaded {new Date(commentary.uploadDate).toLocaleDateString('en-US')}</span>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Author: {commentary.author}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                          <Check size={12} strokeWidth={2} />
                          <span>Active</span>
                        </div>
                        <button
                          onClick={() => handleRemoveCommentary(commentary.id)}
                          className="p-2 rounded-md hover:bg-[var(--light-gray)] transition-colors"
                        >
                          <X size={16} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Supported Formats */}
                <div className="mt-4 p-3 rounded-md bg-[var(--light-gray)]/50">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <strong>Supported formats:</strong> JSON, XML, proprietary formats
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bible Translations */}
          <div>
            <h2 className="text-xs small-caps tracking-[0.12em] text-[var(--muted-foreground)] mb-4">
              Bible Translations
            </h2>
            <div className="p-6 rounded-lg border border-[var(--divider)] bg-[var(--ivory)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium text-[var(--foreground)] mb-1">
                    Translation Library
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Upload JSON translations to enable version switching in study views
                  </p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-[var(--deep-navy)] text-white rounded-md hover:bg-[var(--deep-navy)]/90 transition-colors cursor-pointer">
                  <Upload size={16} strokeWidth={1.5} />
                  <span className="text-sm">Upload JSON</span>
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleBibleUpload}
                  />
                </label>
              </div>

              {bibleTranslations.length === 0 ? (
                <div className="p-4 rounded-md bg-white border border-[var(--divider)] text-xs text-[var(--muted-foreground)]">
                  No custom translations uploaded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {bibleTranslations.map((translation) => (
                    <div
                      key={translation.id}
                      className="flex items-center justify-between p-4 bg-white rounded-md border border-[var(--divider)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[var(--deep-navy)]/10 flex items-center justify-center">
                          <Book size={18} className="text-[var(--deep-navy)]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--foreground)]">
                            {translation.name}
                          </h4>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {translation.abbreviation} • {translation.books.length} books
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveBibleTranslation(translation.id)}
                        className="p-2 rounded-md hover:bg-[var(--light-gray)] transition-colors"
                      >
                        <X size={16} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 rounded-md bg-[var(--light-gray)]/50">
                <p className="text-xs text-[var(--muted-foreground)]">
                  <strong>JSON format:</strong> name, abbreviation, and books/chapters/verses.
                </p>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="p-6 rounded-lg border border-[var(--divider)] bg-white">
            <div className="flex items-start gap-3">
              <FileText size={18} className="text-[var(--deep-navy)] mt-0.5" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
                  Lexicon Integration Guide
                </h3>
                <div className="space-y-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                  <p>
                    1. Upload your lexicon database files in supported formats (JSON, XML, or proprietary formats)
                  </p>
                  <p>
                    2. The system will automatically index and integrate the lexicon data for exegetical analysis
                  </p>
                  <p>
                    3. When analyzing Greek or Hebrew texts, definitions and semantic fields will be pulled from your uploaded lexicons
                  </p>
                  <p>
                    4. Multiple lexicons can be active simultaneously for cross-reference and comparison
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
