import { MarketingPage, MarketingHero } from '@/components/marketing/MarketingPage';

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <MarketingHero
        title="Privacy Policy"
        subtitle="How we collect, use, protect & retain your data."
      />
      <div className="max-w-3xl mx-auto px-6 pb-24 text-sm leading-relaxed space-y-6 text-slate-300">
        <p className="text-slate-400 text-xs uppercase tracking-wide">Last Updated: Jan 15, 2025</p>
        <p>
          We believe contractors should always know what happens to their data. This summary version
          keeps it simple. A full legal version will replace this placeholder.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 text-slate-200">
          {[
            [
              'Data Ownership',
              'You own your project, client, financial & media data. We are a processor.',
            ],
            [
              'Retention',
              'Delete a workspace to purge associated data within 30 days (backups 60).',
            ],
            ['Encryption', 'In transit (TLS 1.3) & at rest (AES‑256). Secrets isolated.'],
            ['Access Control', 'Role & permission enforced per workspace tenant boundary.'],
            ['Backups', 'Automated daily encrypted backups with restore testing.'],
            ['AI Usage', 'Only explicit content you send to AI endpoints leaves the core cluster.'],
          ].map(([h, b]) => (
            <div key={h} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="font-semibold mb-2 text-amber-300 text-sm">{h}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-slate-100 pt-4">Core Principles</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>No data selling or third‑party ad monetization.</li>
          <li>Minimal collection: only what enables features & reliability.</li>
          <li>Transparent breach notification within 72 hours.</li>
          <li>Granular export options (rolling out) for projects & finances.</li>
        </ul>
        <p className="text-slate-400">
          Need a DPA or formal PDF copy? Email{' '}
          <a href="mailto:privacy@remodely.com" className="text-amber-400 hover:text-amber-300">
            privacy@remodely.com
          </a>
          .
        </p>
      </div>
    </MarketingPage>
  );
}
