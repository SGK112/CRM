'use client'

import Link from 'next/link'
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline'

export function DemoVideo() {
  return (
    <div className="bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">
            See Remodely CRM in Action
          </h2>
          <p className="text-lg text-slate-400">
            Watch how construction teams use our platform to streamline operations
          </p>
        </div>

        <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
          <div className="aspect-w-16 aspect-h-9">
            <div className="flex items-center justify-center h-96">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-6 transition-all">
                <PlayIcon className="h-12 w-12 text-white ml-1" />
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-slate-100">
            <h3 className="text-xl font-semibold mb-2">3-Minute Product Tour</h3>
            <p className="text-slate-300">See how Remodely CRM transforms construction workflows</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center px-6 py-3 border border-slate-700 text-base font-medium rounded-md text-slate-200 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-500/50 hover:text-amber-400 transition"
          >
            Try Interactive Demo
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
