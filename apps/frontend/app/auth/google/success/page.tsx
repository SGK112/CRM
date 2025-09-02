'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setError('Missing token');
          router.replace('/auth/login');
          return;
        }

        // Persist token for middleware + client fetches
        try {
          document.cookie = `accessToken=${token}; Path=/; SameSite=Lax`;
        } catch {
          /* noop */
        }
        localStorage.setItem('accessToken', token);

        // Fetch profile to hydrate user state
        try {
          const res = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          if (res.ok) {
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));

            // Check if this user has Google auth (indicating calendar connection)
            if (user.googleAuth && (user.googleAuth.accessToken || user.googleAuth.refreshToken)) {
              if (!cancelled) router.replace('/dashboard/settings/integrations');
              return;
            }
          }
        } catch {
          /* ignore profile errors; token is enough for now */
        }

        if (!cancelled) router.replace('/dashboard');
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Login failed';
        if (!cancelled) {
          setError(errorMessage);
          router.replace('/auth/login');
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-3" />
        <p className="text-sm">Signing you in…</p>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
