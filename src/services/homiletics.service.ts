import { api } from '@/lib/api';

export interface HomileticsPayload {
  id: string;
  central_idea: string;
  divisions: Array<{ id: string; title: string; summary: string }>;
  applications: Array<{ id: string; title: string; body: string }>;
}

export const homileticsService = {
  get: () => api.get<HomileticsPayload>('/api/homiletics'),
  save: (payload: HomileticsPayload) => api.put<HomileticsPayload>('/api/homiletics', payload)
};
