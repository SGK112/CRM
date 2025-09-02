'use client';

export function SocialProof() {
  return (
    <div className="bg-slate-950 py-12 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-8">
            Trusted by 5,000+ Construction Professionals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-semibold text-amber-500">$2.4M+</div>
              <div className="text-sm text-slate-400">Revenue Managed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-amber-500">15,000+</div>
              <div className="text-sm text-slate-400">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-amber-500">98%</div>
              <div className="text-sm text-slate-400">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-amber-500">45%</div>
              <div className="text-sm text-slate-400">Time Savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
