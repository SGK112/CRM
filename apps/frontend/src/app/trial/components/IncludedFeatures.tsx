'use client'

import { CheckIcon } from '@heroicons/react/24/outline'

const trialFeatures = [
  'Full access to all CRM features',
  'Project management tools',
  'Client relationship management',
  'Team collaboration features',
  'Mobile app access',
  'Email and SMS notifications',
  'Document storage (5GB)',
  'Basic reporting and analytics',
  'Email support',
  'No setup fees'
]

export function IncludedFeatures() {
  return (
    <div className="bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">
            Everything You Need to Get Started
          </h2>
          <p className="text-lg text-slate-400">
            Your free trial includes all features with no limitations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {trialFeatures.map((feature, index) => (
            <div key={index} className="flex items-center bg-slate-900/60 border border-slate-800 rounded-md px-4 py-3 hover:border-amber-500/40 hover:bg-slate-900 transition">
              <CheckIcon className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0" />
              <span className="text-slate-300 leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
