'use client';

import {
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export function RiskReversal() {
  return (
    <div className="bg-slate-900/60 py-16 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-100 mb-8">Zero Risk. Maximum Reward.</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center">
            <div className="bg-emerald-500/10 rounded-full p-4 mb-4 ring-1 ring-emerald-500/30">
              <ShieldCheckIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">No Credit Card Required</h3>
            <p className="text-slate-400 text-center">
              Start your trial instantly without any payment information
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-amber-500/10 rounded-full p-4 mb-4 ring-1 ring-amber-500/30">
              <ClockIcon className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">14 Days Free</h3>
            <p className="text-slate-400 text-center">
              Full access to all features with no limitations or restrictions
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-sky-500/10 rounded-full p-4 mb-4 ring-1 ring-sky-500/30">
              <PhoneIcon className="h-8 w-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Free Setup Help</h3>
            <p className="text-slate-400 text-center">
              Our team will help you get started and import your data
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4 text-amber-400">
            <CurrencyDollarIcon className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Limited Time: Save $500</h3>
          </div>
          <p className="text-amber-300 text-center">
            Sign up this month and get your first 3 months for just $39/month (reg. $59).
            <br />
            <span className="font-semibold text-amber-200">That's $500 in savings!</span>
          </p>
        </div>

        <div className="text-slate-400 mb-8">
          <p className="mb-2">
            <strong>What happens after my trial?</strong>
          </p>
          <p>
            After 14 days, you can choose a plan that fits your business. If you don't upgrade, your
            account is simply paused - no charges, no cancellation fees, no hassle.
          </p>
        </div>
      </div>
    </div>
  );
}
