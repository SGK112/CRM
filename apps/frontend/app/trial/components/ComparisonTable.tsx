'use client';

import { CheckIcon } from '@heroicons/react/24/outline';

const comparisonData = [
  {
    feature: 'Project Management',
    remodely: 'Advanced project boards with timeline tracking',
    spreadsheets: 'Manual tracking prone to errors',
    competitors: 'Basic task lists',
  },
  {
    feature: 'Client Communication',
    remodely: 'Automated updates with photo sharing',
    spreadsheets: 'Email chaos and missed updates',
    competitors: 'Limited messaging features',
  },
  {
    feature: 'Cost Tracking',
    remodely: 'Real-time budget monitoring with alerts',
    spreadsheets: 'Static budgets, manual calculations',
    competitors: 'Basic expense tracking',
  },
  {
    feature: 'Mobile Access',
    remodely: 'Full-featured mobile app',
    spreadsheets: 'Poor mobile experience',
    competitors: 'Limited mobile functionality',
  },
];

export function ComparisonTable() {
  return (
    <div className="bg-slate-900/60 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-slate-100 mb-4">Why Choose Remodely CRM?</h2>
          <p className="text-lg text-slate-400">
            See how we compare to spreadsheets and other solutions
          </p>
        </div>

        <div className="bg-slate-950/60 rounded-lg shadow-lg overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-900/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-500 uppercase tracking-wider">
                    Remodely CRM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Spreadsheets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Other CRMs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-950/30 divide-y divide-slate-800">
                {comparisonData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-emerald-400 mr-2" />
                        {row.remodely}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{row.spreadsheets}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{row.competitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
