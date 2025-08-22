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
  title: 'Remodely Ai | Run, Grow & Automate Your Construction Business',
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      <RevealInit />
      {/* Background gradients for visual appeal */}
      <div className="pointer-events-none select-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />
      
      <section className="w-full max-w-3xl text-center py-24 relative z-10">
        <h1 className="heading-primary gradient-amber mb-4">Remodely Ai</h1>
        <p className="text-2xl font-semibold mb-6 text-[var(--text)]">Turn Every Project Into Profit</p>
        <p className="mb-8 text-[var(--text-dim)] text-base sm:text-lg">Stop chasing paperwork and losing track of costs. Our construction CRM streamlines client management, automates estimates to invoices, and keeps your team organized — so you can focus on building great projects.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="/auth/register" className="btn btn-amber shadow-soft shine">Start Free</a>
          <a href="/auth/login" className="btn btn-outline hover:border-amber-500/60 hover:text-amber-300 transition">Sign In</a>
          <a href="/dashboard" className="btn btn-outline hover:border-amber-500/60 hover:text-amber-300 transition">Live Demo →</a>
        </div>
        <div className="flex flex-wrap gap-2 justify-center text-xs font-medium text-[var(--text-dim)] mb-8">
          {['Construction','Remodeling','Trades','IT / Field','Consulting'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] tracking-wide">{tag}</span>
          ))}
        </div>
        <div className="inline-flex items-center justify-center px-4 py-2 bg-amber-600/10 border border-amber-500/30 rounded-full mb-4">
          <p className="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400 uppercase">No credit card • Seats controlled • Usage-based AI</p>
        </div>
      </section>
    </div>
  );
}
