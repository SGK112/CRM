import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-5 rounded-2xl bg-amber-600/10 blur-xl" />
        <div className="relative mx-auto h-24 w-24 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl shadow-black/50 ring-1 ring-slate-600">
          <span className="text-amber-400 font-bold text-3xl">404</span>
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-100 mb-3">Page not found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The page you requested doesn’t exist or was moved. Check the URL or head back to the dashboard.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-sm font-medium text-white shadow shadow-amber-600/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
      >
        Return Home
      </Link>
    </div>
  );
}
