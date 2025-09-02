import { Metadata } from 'next';
import {
  PuzzlePieceIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';
import { MarketingPage, MarketingHero } from '@/components/marketing/MarketingPage';

export const metadata: Metadata = {
  title: 'Integrations & Automation | Remodely CRM',
  description: 'Connect Remodely with finance, communication & ops tools. Zapier, webhooks & API.',
};

const native = [
  {
    name: 'QuickBooks Online',
    category: 'Finance',
    status: 'beta',
    blurb: 'Sync invoices & payments.',
    icon: CloudIcon,
  },
  {
    name: 'Slack',
    category: 'Collaboration',
    status: 'planned',
    blurb: 'Channel alerts & daily digests.',
    icon: CloudIcon,
  },
  {
    name: 'Google Drive',
    category: 'Documents',
    status: 'planned',
    blurb: 'File push & version references.',
    icon: CloudIcon,
  },
  {
    name: 'Procore',
    category: 'Construction',
    status: 'research',
    blurb: 'Data bridge for legacy workflows.',
    icon: CloudIcon,
  },
];

const automation = [
  {
    title: 'Zapier (Early)',
    points: [
      'Trigger on new estimate / invoice',
      'Add client to marketing list',
      'Post schedule change to chat',
      'Create task from form submission',
    ],
  },
  {
    title: 'Webhooks',
    points: [
      'Event posts for: client, project, estimate, invoice changes',
      'Signed payloads (HMAC)',
      'Replay window',
      'Secret rotation',
    ],
  },
  {
    title: 'REST API',
    points: [
      'OAuth & PAT (planned)',
      'Rate limits fair-use',
      'Granular scoping per token',
      'OpenAPI spec forthcoming',
    ],
  },
];

const roadmap = [
  {
    q: 'Q1 2025',
    items: [
      'Zapier public listing',
      'Invoice payment sync (QuickBooks)',
      'Read-only API endpoints GA',
    ],
  },
  {
    q: 'Q2 2025',
    items: [
      'Write endpoints (projects, line items)',
      'Slack alert packs',
      'Expanded webhook filters',
    ],
  },
  {
    q: 'Q3 2025',
    items: ['Google Drive file sync', 'Two-way QuickBooks adjustments', 'Audit log export API'],
  },
];

function statusColor(s: string) {
  switch (s) {
    case 'beta':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'planned':
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    case 'research':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    default:
      return 'text-slate-400 bg-slate-600/10 border-slate-600/30';
  }
}

export default function IntegrationsPage() {
  return (
    <MarketingPage>
      <MarketingHero
        title="Integrations & Automation"
        subtitle="Bridge operations: finance, communication, documents & custom workflows."
      />
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 tracking-tight">Native Connectors</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {native.map(n => (
              <div key={n.name} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <n.icon className="w-5 h-5 text-amber-400" />
                    <h3 className="font-medium text-slate-100">{n.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full border font-medium uppercase tracking-wide ${statusColor(n.status)}`}
                  >
                    {n.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{n.blurb}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-600">{n.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {automation.map(a => (
            <div
              key={a.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <PuzzlePieceIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold tracking-tight">{a.title}</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {a.points.map(p => (
                  <li key={p} className="flex gap-2 items-start">
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-amber-400 mt-0.5" />
                    <span className="leading-snug">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 tracking-tight">Automation Roadmap</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {roadmap.map(r => (
              <div key={r.q} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3">{r.q}</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {r.items.map(it => (
                    <li key={it} className="flex gap-2 items-start">
                      <BoltIcon className="w-3.5 h-3.5 text-amber-400 mt-0.5" />
                      <span className="leading-snug">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-6">
            Sequence & content subject to change based on user feedback & partner timelines.
          </p>
        </div>
      </section>
    </MarketingPage>
  );
}
