'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function CommunicationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inbox immediately
    router.replace('/dashboard/inbox');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Redirecting to Inbox
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Communications have been consolidated into the Inbox...
        </p>
      </div>
    </div>
  );
}
