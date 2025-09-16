'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user wants enhanced form
    const enhanced = searchParams.get('enhanced');
    if (enhanced === 'true') {
      // Redirect to enhanced contact creation page with all parameters preserved
      const params = new URLSearchParams(searchParams.toString());
      router.replace(`/dashboard/clients/new/enhanced?${params.toString()}`);
    } else {
      // Redirect to dashboard onboarding form by default
      router.replace('/dashboard/onboarding');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full" />
    </div>
  );
}
