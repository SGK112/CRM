import { Metadata } from 'next';
import {
  CheckIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
// Using bootstrap-icons CSS class version instead of React wrapper.
import 'bootstrap-icons/font/bootstrap-icons.css';

export const metadata: Metadata = {
  title: 'Features | Remodely CRM',
  description: 'Core capabilities that streamline construction CRM and operations.',
};

const coreFeatures = [
  {
    icon: CalendarIcon,
    title: 'Operational Scheduling',
    description: 'Conflict‑aware crew & subcontractor scheduling with smart workload balancing.',
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Client & Team Communication',
    description: 'Central message hub, structured updates, and automated status notifications.',
  },
  {
    icon: DocumentTextIcon,
    title: 'Documents & Compliance',
    description: 'Controlled repository for contracts, permits, drawings, and change orders.',
  },
  {
    icon: ChartBarIcon,
    title: 'Project & Financial Insights',
    description: 'Live margin tracking, schedule variance, and performance dashboards.',
  },
];

const valuePillars = [
  {
    heading: 'Visibility',
    points: [
      'Portfolio dashboard with real‑time risk indicators',
      'Unified client + project activity timeline',
      'Field updates surface instantly to office teams',
    ],
  },
  {
    heading: 'Control',
    points: [
      'Role‑based permissions & granular audit trail',
      'Standardized workflows & approval gates',
      'Automated reminders reduce manual follow‑ups',
    ],
  },
  {
    heading: 'Profitability',
    points: [
      'Early margin variance detection',
      'Labor & material cost trend monitoring',
      'Template reuse accelerates estimating',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-slate-950 to-slate-950" />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 shadow-inner shadow-amber-500/10">
            <i className="bi bi-rocket text-amber-400 text-4xl leading-none" aria-hidden="true" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
            Focused Features. Real Construction Outcomes.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            We concentrate on the operational core: schedule accuracy, client clarity, financial
            control. Everything else aligns to those three outcomes.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-12 sm:py-20 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-semibold mb-2">Core Capabilities</h2>
          <p className="text-slate-400 mb-10 max-w-2xl">
            Deliberately curated surface area—powerful where it matters, lean where complexity adds
            no value.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map(f => (
              <div
                key={f.title}
                className="group rounded-xl border border-slate-800 bg-slate-900/40 hover:border-amber-500/40 transition p-5 flex flex-col"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-md bg-amber-600/15 text-amber-400 mb-4 ring-1 ring-amber-500/30">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-12 sm:py-20 border-t border-slate-800/60 bg-slate-950 relative">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <h2 className="text-2xl font-semibold mb-2">Why Teams Choose Remodely</h2>
          <p className="text-slate-400 mb-10 max-w-2xl">
            Our product philosophy: remove friction, surface risk early, protect margin, and keep
            stakeholders aligned.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {valuePillars.map(p => (
              <div
                key={p.heading}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col"
              >
                <h3 className="font-semibold mb-4 text-amber-400 tracking-tight">{p.heading}</h3>
                <ul className="space-y-3 text-sm">
                  {p.points.map(pt => (
                    <li key={pt} className="flex items-start gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-400 mt-0.5" />
                      <span className="text-slate-300 leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-6">See It In Action</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Jump into the interactive demo or start a fully featured 14‑day trial. No credit card
            required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/demo"
              className="px-6 py-3 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow-lg shadow-amber-600/20"
            >
              Interactive Demo
            </a>
            <a
              href="/trial"
              className="px-6 py-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm transition border border-slate-700"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
