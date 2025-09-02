'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small construction teams',
    features: [
      'Up to 5 team members',
      '10 active projects',
      '50 clients',
      '5GB storage',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: '$59',
    period: '/month',
    description: 'Ideal for growing businesses',
    features: [
      'Up to 15 team members',
      '50 active projects',
      '200 clients',
      '50GB storage',
      'Priority support',
      'Advanced reporting',
      'API access',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large construction companies',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited clients',
      '500GB storage',
      '24/7 phone support',
      'Custom integrations',
      'Advanced security',
      'Dedicated account manager',
    ],
    popular: false,
  },
];

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState('Professional');

  return (
    <div className="bg-slate-900/60 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">
            Choose Your Plan After Trial
          </h2>
          <p className="text-lg text-slate-400">
            Start free, then pick the plan that fits your business size
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`bg-slate-950/60 rounded-lg shadow-lg overflow-hidden border border-slate-800 ${plan.popular ? 'ring-2 ring-amber-500 shadow-amber-600/20' : ''}`}
            >
              {plan.popular && (
                <div className="bg-amber-600 text-white text-center py-2 text-xs font-medium tracking-wide uppercase">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-100 mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-semibold text-slate-100">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center bg-slate-900/60 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-300"
                    >
                      <CheckIcon className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.popular ? 'bg-amber-600 hover:bg-amber-500 text-white shadow shadow-amber-600/30' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40'}`}
                >
                  {selectedPlan === plan.name ? 'Selected Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 mb-4">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
          <Link
            href="/auth/register"
            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center shadow shadow-amber-600/30"
          >
            Start Your Free Trial
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
