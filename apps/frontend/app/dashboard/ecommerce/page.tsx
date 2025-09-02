'use client';

export default function ComingSoonPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="py-20">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          This feature is under development and will be available soon.
        </p>
        <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700">
          Under Construction
        </div>
      </div>
    </div>
  );
}
