import { Metadata } from 'next'
import { RevealInit } from '@/components/RevealInit'
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Remodely CRM | Run, Grow & Automate Your Construction Business',
  description: 'All‑in‑one construction CRM: clients, estimates → invoices, HR & teams, AI assistant, secure media sharing, flexible usage-based AI tokens.'
}

const features = [
  { icon: DocumentDuplicateIcon, title: 'Estimates → Invoices', blurb: 'Quote. Convert. Get paid.' },
  { icon: CurrencyDollarIcon, title: 'AI Tokens', blurb: 'Only pay when you use AI.' },
  { icon: UserGroupIcon, title: 'Teams & Roles', blurb: 'Seats & permissions.' },
  { icon: PhotoIcon, title: 'Media', blurb: 'Secure project files.' },
  { icon: ShareIcon, title: 'Share Links', blurb: 'Controlled external access.' },
  { icon: SparklesIcon, title: 'AI Assist', blurb: 'Context aware help.' },
  { icon: ChartBarIcon, title: 'Insights', blurb: 'Margins & pipeline.' },
  { icon: ShieldCheckIcon, title: 'Security', blurb: 'Tenant isolation.' }
]

const pillars = [
  { label: 'Run', points: ['Centralize jobs & docs', 'Real-time margins', 'Fast estimating'] },
  { label: 'Grow', points: ['Sharable links', 'Faster approvals', 'Insight dashboards'] },
  { label: 'Automate', points: ['AI drafting', 'One-click conversion', 'Usage-based AI spend'] }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
  <RevealInit />
      {/* Hero (Simplified) */}
      <section className="px-4 sm:px-8 pt-24 pb-14 text-center reveal-stagger">
        <h1 data-reveal className="heading-primary gradient-amber">
          Contracting Runs On Remodely
        </h1>
        <p data-reveal style={{'--stagger':1} as any} className="mt-3 heading-secondary">
          Construct CRM
        </p>
        <p data-reveal style={{'--stagger':2} as any} className="mt-6 max-w-3xl mx-auto text-block text-sm sm:text-base leading-relaxed">
          For construction, remodeling, specialty trades, IT & field service contractors. One fast workspace to estimate, schedule, track, share, invoice & get paid — with on‑demand AI assist.
        </p>
        <div data-reveal style={{'--stagger':3} as any} className="mt-7 flex flex-wrap gap-2 justify-center text-[11px] sm:text-xs font-medium text-slate-400">
          {['Construction','Remodeling','Trades','IT / Field','Consulting'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/60 tracking-wide float-pulse gpu">{tag}</span>
          ))}
        </div>
        <div data-reveal style={{'--stagger':4} as any} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/signup" className="btn btn-amber shadow-soft shine">Start Free</a>
          <a href="/dashboard" className="btn btn-outline hover:border-amber-500/60 hover:text-amber-300 transition">Live Demo →</a>
        </div>
        <p data-reveal style={{'--stagger':5} as any} className="mt-5 text-[10px] tracking-wide text-slate-500 uppercase">No credit card • Seats controlled • Usage-based AI</p>
      </section>

      {/* Features (Concise) */}
      <section className="px-4 sm:px-8 pb-12">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal-stagger">
          {features.map((f, i) => (
            <div data-reveal style={{'--stagger': i} as any} key={i} className="surface-solid p-4 flex flex-col gap-2 transition group hover:shadow-lg">
              <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
                <f.icon className="w-4 h-4 float-pulse" /> {f.title}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{f.blurb}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Pillars (Minimal) */}
      <section className="px-4 sm:px-8 pb-12">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4 reveal-stagger">
          {pillars.map((p, i) => (
            <div data-reveal style={{'--stagger': i} as any} key={i} className="surface-solid p-4 transition hover:shadow-md">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-300 mb-3">{p.label}</h3>
              <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
                {p.points.map((pt, j) => (
                  <li key={j} className="flex gap-1 items-start">
                    <span className="w-1 h-1 mt-1.5 rounded-full bg-amber-400" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      {/* Social Proof Placeholder (Optional simple block) */}
      <section className="px-4 sm:px-8 pb-12">
        <div className="max-w-4xl mx-auto text-center text-slate-400 text-xs sm:text-sm">
          <p><span className="text-slate-200 font-medium">Fast setup.</span> Clear pricing. Built for real field workflows.</p>
        </div>
      </section>

      {/* Final CTA (Short) */}
      <section className="px-4 sm:px-8 pb-20">
        <div data-reveal className="max-w-3xl mx-auto text-center surface-solid p-8">
          <h2 className="heading-secondary mb-4">Get Started</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6">Create a workspace in seconds. Invite your team. Ship more projects.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/signup" className="btn btn-amber shadow-soft">Start Free</a>
            <a href="/support" className="btn btn-outline hover:border-amber-500/60 hover:text-amber-300 transition">Questions?</a>
          </div>
        </div>
      </section>
    </div>
  )
}
