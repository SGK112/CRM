'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard onboarding by default
    router.replace('/dashboard/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );
}
