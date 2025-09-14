import { NextRequest } from 'next/server';

/**
 * Creates headers for backend API requests with proper authentication forwarding
 */
export function createBackendHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward cookie header if present
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  // Forward authorization header if present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return headers;
}

/**
 * Get the backend URL with environment variable fallback
 */
export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.BACKEND_URL || 
         'https://remodely-crm-backend.onrender.com';
}