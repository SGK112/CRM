export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
            <span className="text-sm font-bold text-white">RC</span>
          </div>
          <div className="absolute inset-0 rounded-xl bg-amber-600 animate-ping opacity-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-amber-600 rounded-full animate-bounce"></div>
        </div>
        <p className="text-sm text-[var(--text-dim)] font-medium">Loading Remodely Ai...</p>
      </div>
    </div>
  );
}
