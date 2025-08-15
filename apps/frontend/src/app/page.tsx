import Link from 'next/link'
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  BuildingOffice2Icon,
  BoltIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-amber-600 flex items-center justify-center shadow-inner ring-1 ring-amber-400/40">
              <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-100">Remodely CRM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition">Sign In</Link>
            <Link href="/trial" className="inline-flex items-center rounded-md bg-amber-600 hover:bg-amber-500 text-sm font-semibold px-4 py-2 shadow-sm shadow-amber-600/30 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(30,41,59,0.9),rgba(15,23,42,0.9))]" />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
          <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
        </div>
  <div className="max-w-6xl mx-auto px-6 pt-24 pb-24 md:pt-28 md:pb-32 text-center relative">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-6 text-slate-100">
            Operational Backbone for <span className="text-amber-500">Construction Teams</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-8">
            Projects, clients, schedules, documents, pipeline & field coordination unified – with AI assist – in one rugged platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/trial" className="inline-flex items-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 px-7 py-3 text-base font-semibold shadow shadow-amber-600/30 transition">
              Start Free Trial <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/demo" className="inline-flex items-center rounded-md px-7 py-3 text-base font-medium border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 transition-colors">
              Live Demo
            </Link>
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">No credit card • 14‑day full access • Cancel anytime</p>
        </div>
      </header>

      {/* Value Props */}
  <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <ChartBarIcon className='h-6 w-6' />, title: 'Project Control', desc: 'Real-time status, costs, margins & schedule drift in one view.' },
            { icon: <CpuChipIcon className='h-6 w-6' />, title: 'AI Assist', desc: 'Generate summaries, draft messages, surface risk & next actions.' },
            { icon: <ShieldCheckIcon className='h-6 w-6' />, title: 'Data Security', desc: 'Role-based access, audit trail logging, encrypted storage.' }
          ].map(f => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4 shadow-sm shadow-black/30">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md bg-amber-600/10 text-amber-500 ring-1 ring-amber-600/30 px-3 py-1 text-[11px] font-medium tracking-wide uppercase">
                  {f.icon}
                  Feature
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-100">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(251,191,36,0.07),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 md:p-14 flex flex-col items-center text-center gap-6 shadow-xl shadow-black/40">
            <div className="flex items-center gap-2 text-amber-500">
              <BoltIcon className="h-6 w-6" />
              <span className="font-semibold tracking-wide uppercase text-xs">Get Operational Velocity</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Ready to modernize operations?</h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">Spin up a workspace in under a minute. Import clients, define stages, standardize process & keep field + office aligned.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/trial" className="rounded-md bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-sm font-semibold shadow shadow-amber-600/30 transition">Create Workspace</Link>
              <Link href="/auth/register" className="rounded-md border border-slate-600 hover:border-amber-500/60 px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-amber-400 transition">Email Sign Up</Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-10 border-t border-slate-800 text-center text-xs text-slate-500">© {new Date().getFullYear()} Remodely CRM. All rights reserved.</footer>
    </div>
  )
}
