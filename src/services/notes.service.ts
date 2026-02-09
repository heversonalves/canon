import { api } from '@/lib/api';
import type { Note } from '@/services/studySession.service';

export const notesService = {
  list: (source?: string) => api.get<Note[]>(source ? `/api/notes?source=${source}` : '/api/notes'),
  save: (note: Note) => api.post<Note>('/api/notes', note),
  remove: (id: string) => api.delete<{ status: string }>(`/api/notes/${id}`)
};
