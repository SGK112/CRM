export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="px-4 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Content Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
