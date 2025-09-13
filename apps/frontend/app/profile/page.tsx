'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual profile page in settings
    router.replace('/dashboard/settings/profile');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-[var(--text-dim)]">Redirecting to profile...</p>
      </div>
    </div>
  );
}
