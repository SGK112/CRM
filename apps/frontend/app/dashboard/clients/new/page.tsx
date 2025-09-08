'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to enhanced contact creation page with all parameters preserved
    const params = new URLSearchParams(searchParams.toString());
    router.replace(`/dashboard/clients/new/enhanced?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/10 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );
}
