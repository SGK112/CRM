'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SimplifiedOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const enhanced = searchParams?.get('enhanced');
    const redirectUrl = enhanced ? '/dashboard/onboarding?enhanced=true' : '/dashboard/onboarding';
    router.replace(redirectUrl);
  }, [router, searchParams]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-white">Redirecting to contact creation...</p>
      </div>
    </div>
  );
}
