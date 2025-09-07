'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  useEffect(() => {
    // Redirect to the enhanced profile page
    if (contactId) {
      router.replace(`/dashboard/clients/${contactId}/profile`);
    }
  }, [contactId, router]);

  // Return a loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Loading enhanced profile...</p>
      </div>
    </div>
  );
}
