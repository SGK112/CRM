"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlayIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CheckIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const demoSteps = [
  {
    id: 'plan',
    title: '1. Plan & Qualify',
    icon: ClipboardDocumentListIcon,
    description: 'Capture a lead, qualify scope, and spin up a standardized project shell in minutes.',
    outcomes: ['Lead captured', 'Scope baseline stored', 'Initial budget range', 'Risk flags identified'],
    features: ['Lead intake form → project', 'Auto scope summary (AI)', 'Budget range estimator', 'Client profile linkage'],
    tooltips: [
      { x: 22, y: 18, text: 'AI summarizes discovery notes into structured scope' },
      { x: 70, y: 38, text: 'Baseline budget range auto-calculated' },
      { x: 30, y: 74, text: 'Risk tags (permits, structural, supply chain) surfaced' }
    ]
  },
  {
    id: 'bid',
    title: '2. Estimate & Bid',
    icon: CurrencyDollarIcon,
    description: 'Generate a detailed take‑off, refine cost categories, and issue a polished client proposal.',
    outcomes: ['Itemized take‑off', 'Cost categories validated', 'Proposal PDF generated', 'Client approval tracking'],
    features: ['Template-based take‑offs', 'Cost variance alerts', 'Proposal generator', 'Digital sign-off'],
    tooltips: [
      { x: 25, y: 22, text: 'Take‑off lines grouped by trade & phase' },
      { x: 62, y: 48, text: 'Margin guardrail warning triggers' },
      { x: 40, y: 72, text: 'Client view link / acceptance status' }
    ]
  },
  {
    id: 'execute',
    title: '3. Execute & Track',
    icon: WrenchScrewdriverIcon,
    description: 'Field + office synced: schedule tasks, track costs, manage RFIs, and log daily progress.',
    outcomes: ['Live schedule updates', 'Cost vs budget visibility', 'Daily logs captured', 'Issue / RFI tracking'],
    features: ['Task board & Gantt hybrid', 'Live budget burn chart', 'Mobile daily log capture', 'Photo & doc attachment'],
    tooltips: [
      { x: 20, y: 20, text: 'Critical path highlights schedule risk' },
      { x: 65, y: 42, text: 'Cost burn vs plan trending line' },
      { x: 28, y: 70, text: 'Open issues & RFIs count with aging' }
    ]
  },
  {
    id: 'close',
    title: '4. Close‑out & Insights',
    icon: ShieldCheckIcon,
    description: 'Punchlists resolved, documents archived, performance analytics fed back into estimating.',
    outcomes: ['Punchlist cleared', 'Docs archived', 'Variance analysis', 'Lessons learned module'],
    features: ['Close‑out checklist', 'Auto document bundling', 'Margin variance drilldown', 'AI project retrospective'],
    tooltips: [
      { x: 24, y: 24, text: 'Punchlist completion progress' },
      { x: 60, y: 46, text: 'Variance bars by cost code' },
      { x: 38, y: 72, text: 'AI retrospective summary ready to share' }
    ]
  }
]

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [showTooltips, setShowTooltips] = useState(true)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Hero / Overview */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(30,41,59,0.9),rgba(15,23,42,0.9))]" />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
          <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6">
            Guided Walkthrough: <span className="text-amber-500">Bid → Build → Close</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-8">
            Follow a realistic construction project lifecycle. Each step highlights outcomes, key screens, and how AI removes friction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 px-7 py-3 text-base font-semibold shadow shadow-amber-600/30 transition">
              <PlayIcon className="h-5 w-5" /> Start Interactive Demo
            </button>
            <Link href="/auth/register" className="inline-flex items-center rounded-md px-7 py-3 text-base font-medium border border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-400 transition-colors">
              Launch Workspace <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">4-stage scenario • Real outcomes • No fluff</p>
        </div>
      </header>

      {/* Steps Nav + Progress */}
      <div className="border-b border-slate-800 bg-slate-900/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto py-4">
            {demoSteps.map((step, index) => {
              const Icon = step.icon
              const active = activeStep === index
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium ring-1 transition-colors ${active ? 'bg-amber-600 text-white ring-amber-500 shadow shadow-amber-600/40' : 'bg-slate-800/60 text-slate-300 ring-slate-700 hover:bg-slate-700/60'}`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-semibold ${active ? 'bg-white/15' : 'bg-slate-700/80 text-slate-300'}`}>{index+1}</span>
                  <Icon className="h-4 w-4" />
                  {step.title}
                </button>
              )
            })}
          </div>
          <div className="h-1 w-full bg-slate-800 rounded mb-2">
            <div className="h-full bg-amber-500 rounded transition-all" style={{ width: `${((activeStep+1)/demoSteps.length)*100}%` }} />
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Textual Explanation */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-slate-100">
              {demoSteps[activeStep].title}
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {demoSteps[activeStep].description}
            </p>
            <div className="mb-8 space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2">Key Outcomes</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoSteps[activeStep].outcomes.map((o,i)=>(
                    <li key={i} className="flex items-center text-sm text-slate-300">
                      <CheckIcon className="h-4 w-4 text-amber-500 mr-2" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-2">Highlighted Features</h3>
                <ul className="space-y-2">
                  {demoSteps[activeStep].features.map((f,i)=>(
                    <li key={i} className="flex items-start text-sm text-slate-300">
                      <span className="mt-1 mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-amber-600/20 ring-1 ring-amber-600/40 text-amber-400 text-[11px] font-semibold">{i+1}</span>
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {activeStep > 0 && (
                <button onClick={()=>setActiveStep(activeStep-1)} className="px-5 py-2 text-sm rounded-md border border-slate-700 hover:border-amber-600/60 text-slate-300 hover:text-amber-400 transition">
                  Previous
                </button>
              )}
              {activeStep < demoSteps.length - 1 ? (
                <button onClick={()=>setActiveStep(activeStep+1)} className="px-5 py-2 text-sm rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold inline-flex items-center gap-2 shadow shadow-amber-600/30 transition">
                  Next Step <ChevronRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <Link href="/auth/register" className="px-5 py-2 text-sm rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold inline-flex items-center gap-2 shadow shadow-amber-600/30 transition">
                  Start Free Trial <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <button onClick={()=>setShowTooltips(!showTooltips)} className="px-5 py-2 text-sm rounded-md border border-slate-700 hover:border-amber-600/60 text-slate-300 hover:text-amber-400 transition">
                {showTooltips ? 'Hide Callouts' : 'Show Callouts'}
              </button>
            </div>
          </div>
          {/* Visual Panel */}
          <div className="relative">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 h-10 border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-400 bg-slate-900/60">
                <span>{demoSteps[activeStep].title} View</span>
                <span className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                </span>
              </div>
              <div className="relative h-96 p-5 grid grid-cols-12 gap-4 text-xs">
                {/* Mock layout blocks representing modules; vary by step */}
                <div className="col-span-4 row-span-2 rounded-md bg-slate-800/70 ring-1 ring-slate-700 flex flex-col p-3">
                  <p className="font-semibold text-slate-200 mb-2">Summary</p>
                  <p className="text-slate-400 leading-snug">Auto AI synopsis & key metrics snapshot.</p>
                </div>
                <div className="col-span-4 row-span-3 rounded-md bg-slate-800/40 ring-1 ring-slate-700 flex flex-col p-3">
                  <p className="font-semibold text-slate-200 mb-2">Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>Budget</span><span className="text-amber-400">$1.2M</span></div>
                    <div className="flex justify-between"><span>Margin</span><span className="text-amber-400">18%</span></div>
                    <div className="flex justify-between"><span>Schedule</span><span className="text-amber-400">+4d</span></div>
                  </div>
                </div>
                <div className="col-span-4 row-span-4 rounded-md bg-slate-800/40 ring-1 ring-slate-700 flex flex-col p-3">
                  <p className="font-semibold text-slate-200 mb-2">Activity</p>
                  <ul className="space-y-1 text-slate-400">
                    <li>RFI #12 answered</li>
                    <li>Cost code 0310 updated</li>
                    <li>Daily log submitted</li>
                  </ul>
                </div>
                <div className="col-span-8 row-span-2 rounded-md bg-slate-800/60 ring-1 ring-slate-700 flex flex-col p-3">
                  <p className="font-semibold text-slate-200 mb-2">Primary Board</p>
                  <div className="flex gap-2 overflow-hidden">
                    {["Planned","Active","Review","Done"].map(stage=> <span key={stage} className="px-2 py-1 rounded bg-slate-700/60 text-slate-300 text-[10px] tracking-wide">{stage}</span>)}
                  </div>
                </div>
                <div className="col-span-8 row-span-2 rounded-md bg-slate-800/40 ring-1 ring-slate-700 flex flex-col p-3">
                  <p className="font-semibold text-slate-200 mb-2">Chart</p>
                  <div className="flex-1 flex items-end gap-1">
                    {[50,70,40,90,65].map((h,i)=> <div key={i} className="flex-1 bg-slate-700/60 relative overflow-hidden rounded"><div style={{height:`${h}%`}} className="absolute bottom-0 inset-x-0 bg-amber-500/70" /></div>)}
                  </div>
                </div>
                {/* Tooltip overlays */}
                {showTooltips && demoSteps[activeStep].tooltips.map((t,i)=>(
                  <div key={i} className="absolute z-10 text-[11px] pointer-events-none" style={{left:`${t.x}%`, top:`${t.y}%`, transform:'translate(-50%,-50%)'}}>
                    <div className="bg-amber-600/90 text-slate-900 font-medium px-2 py-1 rounded shadow-lg ring-1 ring-amber-400/60 whitespace-nowrap">{t.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Value */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h3 className="text-center text-2xl font-semibold tracking-tight mb-10">Value by Role</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            title:'Owner / Principal',
            points:['Portfolio margin visibility','Risk surfaced early','Standardized close‑outs']
          },{
            title:'Project Manager',
            points:['Single source of truth','Clear schedule drift signals','Rapid document retrieval']
          },{
            title:'Field Lead',
            points:['Fast daily logs','Mobile photo capture','Punchlist clarity']
          }].map(card=> (
            <div key={card.title} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4">
              <h4 className="font-semibold text-slate-100">{card.title}</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {card.points.map(p=> <li key={p} className="flex items-start"><CheckIcon className="h-4 w-4 text-amber-500 mr-2 mt-[2px]" /> <span>{p}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(251,191,36,0.07),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 flex flex-col items-center text-center gap-6 shadow-xl shadow-black/40">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-100">Ready to Run a Tighter Operation?</h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">Deploy in minutes. Standardize process, gain real-time visibility, and feed every project back into smarter future estimates.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="rounded-md bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-sm font-semibold shadow shadow-amber-600/30 transition">Start Free Trial</Link>
              <Link href="/auth/login" className="rounded-md border border-slate-600 hover:border-amber-500/60 px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-amber-400 transition">Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
