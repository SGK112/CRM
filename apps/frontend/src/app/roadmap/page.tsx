import { Metadata } from 'next'
import { CheckIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Roadmap | Remodely CRM',
  description: 'See what we\'re building next for construction teams.'
}

const roadmapItems = [
  {
    title: 'Advanced AI Project Assistant',
    description: 'Smart recommendations for scheduling, resource allocation, and risk detection.',
    status: 'in-progress',
    quarter: 'Q1 2025',
    features: ['Predictive scheduling conflicts', 'Auto-generated project timelines', 'Risk assessment scoring']
  },
  {
    title: 'Mobile App (iOS/Android)',
    description: 'Native mobile apps for field teams with offline capabilities.',
    status: 'planned',
    quarter: 'Q2 2025',
    features: ['Offline project access', 'Photo & document capture', 'Time tracking']
  },
  {
    title: 'Advanced Financial Analytics',
    description: 'Deep financial insights with profit margin tracking and forecasting.',
    status: 'planned',
    quarter: 'Q3 2025',
    features: ['Profit margin trends', 'Cash flow forecasting', 'Cost variance analysis']
  },
  {
    title: 'Subcontractor Portal',
    description: 'Dedicated portal for subcontractors to manage their work and communications.',
    status: 'planned',
    quarter: 'Q4 2025',
    features: ['Sub portal access', 'Progress reporting', 'Invoice submission']
  },
  {
    title: 'Enhanced Document Management',
    description: 'Advanced document workflows with approval chains and version control.',
    status: 'completed',
    quarter: 'Q4 2024',
    features: ['Document approval workflows', 'Version control', 'Digital signatures']
  },
  {
    title: 'Integrated Messaging System',
    description: 'Built-in chat and communication tools for team collaboration.',
    status: 'completed',
    quarter: 'Q3 2024',
    features: ['Team chat channels', 'Project-specific messaging', 'File sharing']
  }
]

const statusConfig = {
  'completed': { 
    icon: CheckIcon, 
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    label: 'Completed'
  },
  'in-progress': { 
    icon: SparklesIcon, 
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    label: 'In Progress'
  },
  'planned': { 
    icon: ClockIcon, 
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    label: 'Planned'
  }
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile-first Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-6">
            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Product Roadmap
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            See what we're building to make construction project management even more powerful and intuitive.
          </p>
        </div>
      </section>

      {/* Mobile-first Roadmap Items */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            {roadmapItems.map((item, index) => {
              const StatusIcon = statusConfig[item.status as keyof typeof statusConfig].icon;
              const statusColor = statusConfig[item.status as keyof typeof statusConfig].color;
              const statusLabel = statusConfig[item.status as keyof typeof statusConfig].label;

              return (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 hover:border-amber-500/40 transition-colors">
                  {/* Mobile-optimized header */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusLabel}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-400 font-medium">{item.quarter}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Mobile-optimized features list */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Key Features:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckIcon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile-first CTA */}
          <div className="mt-12 text-center">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">Have a Feature Request?</h2>
              <p className="text-slate-400 mb-6 text-sm sm:text-base">
                We love hearing from our users. Share your ideas and help shape the future of Remodely CRM.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow shadow-amber-600/30"
                >
                  Contact Us
                </a>
                <a 
                  href="/support" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 font-medium text-sm transition"
                >
                  Support Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
