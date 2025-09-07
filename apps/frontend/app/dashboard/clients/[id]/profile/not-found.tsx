import Link from 'next/link';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-6">
            <UserIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Client Not Found
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The client profile you're looking for doesn't exist or may have been removed. 
            Please check the URL or search for the client in your contacts.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
