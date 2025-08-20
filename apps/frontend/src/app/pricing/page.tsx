import { Metadata } from 'next'
import { CheckIcon, SparklesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { MarketingPage, MarketingHero } from '@/components/marketing/MarketingPage'

export const metadata: Metadata = {
  title: 'Pricing | Remodely CRM',
  description: 'Simple, scalable pricing for construction teams. Start free and upgrade when you grow.'
}

const plans = [
  {
    name: 'Starter',
    priceMonthly: 29,
    priceYearly: 24,
    blurb: 'Small crews getting organized',
    highlight: false,
    cta: 'Get Starter',
    features: [
      '5 team members',
      '10 active projects',
      '50 clients',
      '5 GB storage',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    priceMonthly: 59,
    priceYearly: 49,
    blurb: 'Growing operations & multi-trade',
    highlight: true,
    cta: 'Get Professional',
    features: [
      '15 team members',
      '50 active projects',
      '200 clients',
      '50 GB storage',
      'Priority support',
      'Advanced reporting',
      'API access'
    ]
  },
  {
    name: 'Enterprise',
    priceMonthly: 99,
    priceYearly: 82,
    blurb: 'Scale, security & custom flows',
    highlight: false,
    cta: 'Contact Sales',
    features: [
      'Unlimited team members',
      'Unlimited projects & clients',
      '500 GB storage',
      '24/7 phone support',
      'Custom integrations',
      'Advanced security',
      'Dedicated CSM'
    ]
  }
]

const featureMatrix: { section:string; items:{ label:string; tiers:(boolean|string)[] }[] }[] = [
  {
    section: 'Core Platform',
    items: [
      { label:'Projects & Scheduling', tiers:[true,true,true] },
      { label:'Estimates → Invoices', tiers:[true,true,true] },
      { label:'Client CRM', tiers:[true,true,true] },
      { label:'Document Storage', tiers:['5GB','50GB','500GB'] },
      { label:'Change Order Tracking', tiers:[false,true,true] }
    ]
  },
  {
    section: 'Performance & Insights',
    items: [
      { label:'Margin Tracking', tiers:[true,true,true] },
      { label:'Cost Variance Alerts', tiers:[false,true,true] },
      { label:'Portfolio Dashboards', tiers:[false,true,true] },
      { label:'Custom Reports', tiers:[false,false,true] }
    ]
  },
  {
    section: 'Collaboration & Access',
    items: [
      { label:'Role Permissions', tiers:[true,true,true] },
      { label:'Subcontractor Portal', tiers:[false,false,true] },
      { label:'External Share Links', tiers:[true,true,true] },
      { label:'API Access', tiers:[false,true,true] },
      { label:'SSO / SAML', tiers:[false,false,true] }
    ]
  },
  {
    section: 'Support & Success',
    items: [
      { label:'Email Support', tiers:[true,true,true] },
      { label:'Priority Queue', tiers:[false,true,true] },
      { label:'24/7 Phone', tiers:[false,false,true] },
      { label:'Dedicated CSM', tiers:[false,false,true] }
    ]
  }
]

export default function PricingPage(){
  return (
    <MarketingPage>
      <MarketingHero title="Straightforward Pricing" subtitle="Start free. Upgrade only when your operation demands more." />
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-10 text-xs text-slate-400">
            <div className="flex items-center gap-1"><SparklesIcon className="w-4 h-4 text-amber-400"/> <span>No credit card for trial</span></div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1"><CurrencyDollarIcon className="w-4 h-4 text-amber-400"/> <span>Usage-based AI</span></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(p=> (
              <div key={p.name} className={`relative rounded-xl border ${p.highlight? 'border-amber-500/50 ring-2 ring-amber-500/40 shadow-lg shadow-amber-600/20':'border-slate-800'} bg-slate-900/40 p-6 flex flex-col`}> 
                {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-[10px] font-semibold tracking-wide text-slate-900 shadow">MOST POPULAR</span>}
                <h3 className="text-xl font-semibold mb-1 tracking-tight">{p.name}</h3>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{p.blurb}</p>
                <div className="mb-5 flex items-end gap-1">
                  <span className="text-4xl font-semibold">${p.priceMonthly}</span>
                  <span className="text-slate-400 text-sm mb-1">/mo</span>
                  <span className="ml-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">${p.priceYearly}/mo annual</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  {p.features.map(f=> (
                    <li key={f} className="flex items-start gap-2"><CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5"/><span className="text-slate-300 leading-snug">{f}</span></li>
                  ))}
                </ul>
                <button className={`mt-auto w-full rounded-md py-2.5 text-sm font-medium transition ${p.highlight? 'bg-amber-600 hover:bg-amber-500 text-white shadow shadow-amber-600/30':'bg-slate-800/70 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/40'}`}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 tracking-tight">Feature Breakdown</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/40">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  {plans.map(p=> <th key={p.name} className="py-3 px-4 font-medium text-center">{p.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {featureMatrix.map(group=> (
                  <>
                    <tr key={group.section} className="bg-slate-800/40">
                      <td colSpan={4} className="py-2 px-4 text-amber-400 font-semibold text-xs tracking-wide">{group.section}</td>
                    </tr>
                    {group.items.map(item=> (
                      <tr key={item.label}>
                        <td className="py-2 px-4 text-slate-300">{item.label}</td>
                        {item.tiers.map((val,i)=> (
                          <td key={i} className="py-2 px-4 text-center">
                            {val===true && <CheckIcon className="w-4 h-4 text-emerald-400 inline"/>}
                            {val===false && <span className="text-slate-600">—</span>}
                            {typeof val==='string' && <span className="text-slate-200 text-xs font-medium">{val}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">* AI usage billed separately via token consumption. All prices in USD. Taxes may apply.</p>
        </div>
      </section>
    </MarketingPage>
  )
}
