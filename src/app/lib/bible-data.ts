export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  name: string;
  chapters: BibleChapter[];
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  books: BibleBook[];
  source?: string;
}

const STORAGE_KEY = 'canon.bibleTranslations';

const cleanString = (value: string) => value.trim();

const toBookKey = (value: string) => value.trim().toLowerCase();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseVerseList = (data: unknown): BibleVerse[] => {
  if (Array.isArray(data)) {
    return data
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return { number: index + 1, text: entry };
        }
        if (isRecord(entry)) {
          const number = typeof entry.number === 'number' ? entry.number : index + 1;
          const text = typeof entry.text === 'string' ? entry.text : '';
          return { number, text };
        }
        return null;
      })
      .filter((verse): verse is BibleVerse => Boolean(verse && verse.text));
  }

  if (isRecord(data)) {
    return Object.entries(data)
      .map(([key, value]) => {
        if (typeof value !== 'string') return null;
        const number = Number(key);
        return Number.isNaN(number) ? null : { number, text: value };
      })
      .filter((verse): verse is BibleVerse => Boolean(verse && verse.text));
  }

  return [];
};

const parseChapterList = (data: unknown): BibleChapter[] => {
  if (Array.isArray(data)) {
    return data
      .map((entry, index) => {
        if (isRecord(entry) && Array.isArray(entry.verses)) {
          const number = typeof entry.number === 'number' ? entry.number : index + 1;
          return { number, verses: parseVerseList(entry.verses) };
        }
        return {
          number: index + 1,
          verses: parseVerseList(entry)
        };
      })
      .filter((chapter) => chapter.verses.length > 0);
  }

  if (isRecord(data)) {
    return Object.entries(data)
      .map(([key, value]) => {
        const number = Number(key);
        if (Number.isNaN(number)) return null;
        return { number, verses: parseVerseList(value) };
      })
      .filter((chapter): chapter is BibleChapter => Boolean(chapter && chapter.verses.length));
  }

  return [];
};

const parseBookList = (data: unknown): BibleBook[] => {
  if (Array.isArray(data)) {
    return data
      .map((entry) => {
        if (!isRecord(entry)) return null;
        const name = typeof entry.name === 'string' ? entry.name : '';
        const chapters = parseChapterList(entry.chapters);
        if (!name || chapters.length === 0) return null;
        return { name, chapters };
      })
      .filter((book): book is BibleBook => Boolean(book));
  }

  if (isRecord(data)) {
    return Object.entries(data)
      .map(([name, chapters]) => {
        const parsedChapters = parseChapterList(chapters);
        if (parsedChapters.length === 0) return null;
        return { name, chapters: parsedChapters };
      })
      .filter((book): book is BibleBook => Boolean(book));
  }

  return [];
};

export const parseBibleJson = (raw: unknown): BibleTranslation | null => {
  if (!isRecord(raw)) return null;

  const name =
    typeof raw.name === 'string'
      ? raw.name
      : typeof raw.translation === 'string'
        ? raw.translation
        : typeof raw.version === 'string'
          ? raw.version
          : 'Custom Translation';
  const abbreviation =
    typeof raw.abbreviation === 'string'
      ? raw.abbreviation
      : typeof raw.shortName === 'string'
        ? raw.shortName
        : name;
  const books = parseBookList(raw.books ?? raw.data ?? raw.bible ?? raw);

  if (!books.length || !name) return null;

  return {
    id: `${abbreviation}-${Date.now()}`,
    name: cleanString(name),
    abbreviation: cleanString(abbreviation),
    books,
    source: typeof raw.source === 'string' ? raw.source : 'custom'
  };
};

export const loadBibleTranslations = (): BibleTranslation[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => isRecord(item)) as BibleTranslation[];
  } catch {
    return [];
  }
};

export const saveBibleTranslations = (translations: BibleTranslation[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
};

export const findBook = (translation: BibleTranslation, bookName: string) =>
  translation.books.find((book) => toBookKey(book.name) === toBookKey(bookName));

export const findChapter = (book: BibleBook | undefined, chapterNumber: number) =>
  book?.chapters.find((chapter) => chapter.number === chapterNumber);

export const findVerseText = (
  translation: BibleTranslation,
  bookName: string,
  chapterNumber: number,
  verseNumber: number
) => {
  const book = findBook(translation, bookName);
  const chapter = findChapter(book, chapterNumber);
  const verse = chapter?.verses.find((v) => v.number === verseNumber);
  return verse?.text;
};
