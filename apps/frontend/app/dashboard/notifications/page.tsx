'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified inbox since notifications are now merged
    router.replace('/dashboard/inbox');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Redirecting to Inbox...
        </h2>
        <p className="text-gray-600">
          Notifications have been merged with the inbox for a unified experience.
        </p>
      </div>
    </div>
  );
}
