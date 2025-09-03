// Centralized API base configuration and helper fetch wrapper
// Prefer using this instead of hard-coding http://localhost:3001 in components.

function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
  // Normalize by removing trailing slash and any trailing /api from env.
  return raw.replace(/\/$/, '').replace(/(?:\/api)+$/, '');
}

export const API_BASE: string = getApiBase();
export const API_PREFIX: string = `${API_BASE}/api`;

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
  const res = await fetch(`${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`, init);
  return res;
}
