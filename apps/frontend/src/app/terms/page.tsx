import { MarketingPage, MarketingHero } from '@/components/marketing/MarketingPage'

export default function TermsPage() {
  return (
    <MarketingPage>
      <MarketingHero title="Terms of Service" subtitle="Plain‑language summary of your agreement using Remodely." />
      <div className="max-w-3xl mx-auto px-6 pb-24 text-sm leading-relaxed space-y-7 text-slate-300">
        <p className="text-slate-400 text-xs uppercase tracking-wide">Last Updated: Jan 15, 2025</p>
        <p>Using Remodely means you agree to operate within these baseline terms while we continue preparing the final extended legal version.</p>
        <div className="space-y-5">
          {[
            ['Account & Seats','You control who you invite. You are responsible for seat usage & permission accuracy.'],
            ['Acceptable Use','No abusive, infringing, or illegal project content. We may suspend for risk or abuse.'],
            ['Data Portability','You can export critical records (clients, estimates, invoices). More export formats rolling out.'],
            ['Payment','Usage (AI tokens) + subscription billing must stay current to avoid read‑only mode.'],
            ['Service Levels','We target 99.9% monthly uptime excluding scheduled maintenance.'],
            ['Liability Cap','Limited to fees paid in the prior 12 months. No consequential damages.']
          ].map(([h,b])=> (
            <div key={h} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="font-semibold mb-2 text-amber-300 text-sm">{h}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-slate-100 pt-4">Your Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Maintain accurate billing & company info.</li>
          <li>Respect IP ownership of uploaded plans & media.</li>
          <li>Ensure proper consent for data you store.</li>
          <li>Notify us promptly of suspected security issues.</li>
        </ul>
        <p className="text-slate-400">Need signed enterprise agreements? Contact <a href="mailto:legal@remodely.com" className="text-amber-400 hover:text-amber-300">legal@remodely.com</a>.</p>
      </div>
    </MarketingPage>
  )
}
