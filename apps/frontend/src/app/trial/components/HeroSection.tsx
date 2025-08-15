'use client'

import Link from 'next/link'
import { ArrowRightIcon, ShieldCheckIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(30,41,59,0.9),rgba(15,23,42,0.95))]" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute top-1/4 -right-28 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6 text-slate-100">
          Start Your <span className="text-amber-500">Free 14-Day</span> Trial
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto">
          No credit card required. Full feature access. Cancel anytime. See why construction teams run on Remodely.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 px-8 py-4 text-lg font-semibold shadow shadow-amber-600/30 transition">
            Start Free Trial <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <Link href="/demo" className="inline-flex items-center rounded-md px-8 py-4 text-lg font-medium border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 transition-colors">
            Live Demo
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-wide text-slate-500">
          <div className="flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-amber-500" /> No Credit Card</div>
          <div className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-amber-500" /> 14 Days Full Access</div>
          <div className="flex items-center gap-2"><UserGroupIcon className="h-4 w-4 text-amber-500" /> 5,000+ Users</div>
        </div>
      </div>
    </div>
  )
}
