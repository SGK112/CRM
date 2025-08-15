'use client'

import Link from 'next/link'
import { ArrowRightIcon, PlayIcon, ShieldCheckIcon, ClockIcon, UserGroupIcon, BuildingOfficeIcon, ChartBarIcon, StarIcon } from '@heroicons/react/24/outline'

export function FinalCTA() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(30,41,59,0.95),rgba(15,23,42,0.95))]" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-slate-100 mb-4">Ready to Transform Your Construction Business?</h2>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">Join 5,000+ construction professionals who've increased efficiency by 45% with Remodely CRM</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth/register" className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center transition-all transform hover:scale-105 shadow shadow-amber-600/30">
              Start Free 14-Day Trial <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            
            <Link href="/demo" className="border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center transition-colors">
              Watch 3-Min Demo <PlayIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-slate-500 text-sm">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              No credit card required
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Setup in under 5 minutes
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              Free onboarding support
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm mb-4">Trusted by construction companies nationwide</p>
            <div className="flex flex-wrap justify-center items-center gap-10">
              <div className="text-slate-500 flex flex-col items-center">
                <BuildingOfficeIcon className="h-8 w-8 mb-1" />
                <div className="text-[11px] uppercase tracking-wide">500+ Companies</div>
              </div>
              <div className="text-slate-500 flex flex-col items-center">
                <ChartBarIcon className="h-8 w-8 mb-1" />
                <div className="text-[11px] uppercase tracking-wide">$2.4M+ Managed</div>
              </div>
              <div className="text-slate-500 flex flex-col items-center">
                <StarIcon className="h-8 w-8 mb-1 fill-current" />
                <div className="text-[11px] uppercase tracking-wide">4.9/5 Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
