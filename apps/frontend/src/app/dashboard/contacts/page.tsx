// Temporary server-rendered alias page for /dashboard/contacts
// This ensures Next's router recognizes the path during dev. Replace with
// a shared component import once routing is stable.
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactsAliasPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the canonical clients page while we incrementally rename routes.
    router.replace('/dashboard/clients');
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Contacts</h1>
      <p className="mt-2 text-sm text-gray-600">Redirecting to Contacts list...</p>
    </div>
  );
}
