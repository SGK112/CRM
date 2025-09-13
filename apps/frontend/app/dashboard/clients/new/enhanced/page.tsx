'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function EnhancedContactCreationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to simplified onboarding with all parameters preserved
    const params = new URLSearchParams(searchParams.toString());
    // Add enhanced flag to enable more features in simplified form
    params.set('enhanced', 'true');
          router.replace('/dashboard/onboarding?enhanced=true');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );
}
