'use client';

import Link from 'next/link';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export function Navigation() {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
            <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-100">Remodely CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition"
          >
            Sign In
          </Link>
          <Link
            href="/trial"
            className="inline-flex items-center rounded-md bg-amber-600 hover:bg-amber-500 text-sm font-semibold px-4 py-2 shadow-sm shadow-amber-600/30 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
