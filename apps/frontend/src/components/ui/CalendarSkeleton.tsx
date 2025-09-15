export default function CalendarSkeleton() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="h-8 w-40 bg-slate-800 rounded mb-6" />
      <div className="grid grid-cols-4 gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-800 rounded" />
        ))}
      </div>
      <div className="h-[500px] bg-slate-800 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-800 rounded" />
        ))}
      </div>
    </div>
  );
}
