'use client'

import { CheckIcon, CalendarIcon, ChatBubbleBottomCenterTextIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const keyFeatures = [
  {
    icon: CalendarIcon,
    title: 'Smart Scheduling',
    description: 'AI-powered scheduling that prevents conflicts and optimizes your team\'s time',
    benefits: ['Reduces scheduling conflicts by 90%', 'Automatic reminders', 'Mobile calendar sync']
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Client Communication Hub',
    description: 'Centralized communication keeps clients informed and projects on track',
    benefits: ['Real-time project updates', 'Automated status emails', 'Photo sharing']
  },
  {
    icon: DocumentTextIcon,
    title: 'Document Management',
    description: 'Organize contracts, permits, and blueprints in one secure location',
    benefits: ['Version control', 'Digital signatures', 'Cloud backup']
  },
  {
    icon: ChartBarIcon,
    title: 'Performance Analytics',
    description: 'Track profitability, timeline accuracy, and team performance',
    benefits: ['ROI tracking', 'Profit margin analysis', 'Performance dashboards']
  }
]

export function FeatureShowcase() {
  return (
    <div className="bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">
            Powerful Features Built for Construction
          </h2>
          <p className="text-lg text-slate-400">Everything you need to run your construction business efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {keyFeatures.map((feature, index) => (
            <div key={index} className="bg-slate-900/60 rounded-lg p-6 border border-slate-800 hover:border-amber-500/40 transition">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-amber-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-slate-300 bg-slate-800/60 rounded-md px-3 py-2 border border-slate-700">
                        <CheckIcon className="h-4 w-4 text-emerald-400 mr-2 flex-shrink-0" />
                        <span className="leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
