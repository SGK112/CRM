import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Contact Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The contact profile you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Contacts
        </Link>
      </div>
    </div>
  );
}
