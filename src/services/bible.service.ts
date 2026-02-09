import { api } from '@/lib/api';
import type { Verse } from '@/services/studySession.service';

interface BibleChapterResponse {
  book: string;
  chapter: number;
  verses: Verse[] | string[];
}

export const bibleService = {
  getChapter: async (translation: string, book: string, chapter: number): Promise<Verse[]> => {
    const data = await api.get<BibleChapterResponse>(`/api/bible/${translation}/${encodeURIComponent(book)}/${chapter}`);
    if (!Array.isArray(data.verses)) return [];
    return data.verses.map((verse, index) => {
      if (typeof verse === 'string') {
        return { number: index + 1, text: verse };
      }
      return { number: verse.number, text: verse.text };
    });
  }
};
