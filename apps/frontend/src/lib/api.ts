// Centralized API base configuration and helper fetch wrapper
// Prefer using this instead of hard-coding http://localhost:3001 in components.

export const API_BASE: string =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

export function withAuthHeaders(init: RequestInit = {}): RequestInit {
  if (typeof window === 'undefined') return init;
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!token) return init;
  return {
    ...init,
    headers: {
      ...((init.headers as Record<string, string>) || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, init);
  return res;
}
