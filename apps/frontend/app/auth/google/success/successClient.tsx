'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleAuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        document.cookie = `accessToken=${token}; Path=/; SameSite=Lax`;
      } catch {
        void 0; // ignore cookie set errors
      }
      localStorage.setItem('accessToken', token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          workspaceId: payload.workspaceId,
        } as any;
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing Google auth:', error);
        router.push('/auth/login?error=google_auth_failed');
      }
    } else {
      router.push('/auth/login?error=no_token');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Completing Google Sign In...</h2>
          <p className="mt-2 text-gray-600">Please wait while we sign you in.</p>
        </div>
      </div>
    </div>
  );
}
