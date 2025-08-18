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
          <p className="mt-4 text-xs uppercase tracking-wide font-medium bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(16,185,129,0.25)]">No credit card • 14‑day full access • Cancel anytime</p>
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
      <section className="relative py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_55%)]" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/75 p-10 md:p-16 flex flex-col items-center text-center gap-7 shadow-2xl shadow-black/50 ring-1 ring-slate-700/50">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute inset-0 rounded-xl bg-emerald-400/15 blur" />
                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20" />
                <BoltIcon className="relative h-6 w-6 drop-shadow-[0_0_6px_rgba(16,185,129,0.65)]" />
              </span>
              <span className="font-semibold tracking-wide uppercase text-[11px] text-emerald-300/90">Get Operational Velocity</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-slate-100 via-emerald-100 to-amber-100 bg-clip-text text-transparent">Ready To Transform Your Construction Business?</h2>
            <p className="text-slate-300/90 max-w-3xl text-sm md:text-base leading-relaxed">
              Unify project tracking, field coordination and client communication under one roof. Launch a production-grade workspace in under a minute—import clients, standardize stages and let AI surface risk before it becomes rework.
            </p>
            <ul className="grid sm:grid-cols-3 gap-4 w-full max-w-4xl mt-2 text-left">
              {[
                { label: 'Real-time Project Health', color: 'from-emerald-400 to-emerald-500' },
                { label: 'AI Risk Summaries', color: 'from-amber-400 to-amber-500' },
                { label: 'Field ↔ Office Sync', color: 'from-sky-400 to-sky-500' },
              ].map(item => (
                <li key={item.label} className="relative rounded-lg border border-slate-700/70 bg-slate-800/60 px-4 py-3 flex items-center gap-3 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${item.color} shadow shadow-black/40`} />
                  <span className="text-slate-200/90">{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/trial" className="group rounded-md bg-emerald-500 hover:bg-emerald-400 px-7 py-3 text-sm font-semibold text-slate-900 shadow shadow-emerald-500/30 transition relative overflow-hidden">
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 mix-blend-overlay transition" />
                <span className="relative">Start Free Trial</span>
              </Link>
              <Link href="/auth/register" className="rounded-md border border-slate-600 hover:border-emerald-400/60 px-7 py-3 text-sm font-medium text-slate-300 hover:text-emerald-300 transition">Create Account</Link>
            </div>
            <p className="text-[11px] uppercase tracking-wide font-medium text-emerald-300/80">No credit card • 14‑day full access • Cancel anytime</p>
          </div>
        </div>
      </section>
    </div>
  )
}
