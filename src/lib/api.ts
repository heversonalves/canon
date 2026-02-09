const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const buildUrl = (path: string) => {
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options
  });

  if (!response.ok) {
    throw new ApiError(await response.text(), response.status);
  }

  return response.json() as Promise<T>;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};
