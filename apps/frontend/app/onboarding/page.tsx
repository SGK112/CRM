'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard onboarding by default
    router.replace('/dashboard/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );
}
