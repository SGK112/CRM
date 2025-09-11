'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Simple redirect page to avoid build issues
export default function NotificationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper notifications page in dashboard
    router.replace('/dashboard/notifications');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Redirecting...</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Taking you to your notifications...
        </p>
      </div>
    </div>
  );
}
