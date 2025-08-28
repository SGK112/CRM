'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '../../../../components/Layout';
import { PageHeader } from '../../../../components/ui/PageHeader';
import PlanSwitcher from '../../../../components/PlanSwitcher';
import { CapabilityGate, PlanBadge } from '../../../../components/CapabilityGate';
import { getUserPlan, PLANS, type PlanTier } from '@/lib/plans';
import { 
  CreditCardIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function BillingSettingsPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('basic');
  const [loading, setLoading] = useState(true);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get('upgrade') as PlanTier;

  useEffect(() => {
    setCurrentPlan(getUserPlan());
    setLoading(false);
    
    // Mock billing history
    setBillingHistory([
      {
        id: '1',
        date: '2024-01-01',
        plan: 'AI Professional',
        amount: 49,
        status: 'paid',
        period: 'January 2024'
      },
      {
        id: '2',
        date: '2024-02-01', 
        plan: 'AI Professional',
        amount: 49,
        status: 'paid',
        period: 'February 2024'
      },
      {
        id: '3',
        date: '2024-03-01',
        plan: 'AI Professional', 
        amount: 49,
        status: 'pending',
        period: 'March 2024'
      }
    ]);
  }, []);

  const handlePlanChange = (newPlan: PlanTier) => {
    setCurrentPlan(newPlan);
  };

  const planData = PLANS[currentPlan];

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader 
          title="Billing & Plans" 
          subtitle="Manage your subscription and billing information"
          titleClassName="font-bold text-brand-700 dark:text-brand-400"
          actions={
            <div className="flex items-center gap-3">
              <PlanBadge plan={currentPlan} />
            </div>
          }
        />

        {/* Current Plan Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Plan: {planData.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {planData.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${planData.price}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                per {planData.period}
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                12 / {planData.capabilities['limits.clients'] === -1 ? '∞' : planData.capabilities['limits.clients']}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                8 / {planData.capabilities['limits.projects'] === -1 ? '∞' : planData.capabilities['limits.projects']}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Storage</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                2.1 / {planData.capabilities['limits.storage_gb']}GB
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Requests</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPlan === 'basic' ? '0 / 0' : 
                 planData.capabilities['limits.ai_requests'] === -1 ? '1,247 / ∞' : 
                 `1,247 / ${planData.capabilities['limits.ai_requests']}`}
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Plan Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {planData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircleIcon className={`w-5 h-5 ${
                    feature.included 
                      ? 'text-green-500' 
                      : 'text-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    feature.included 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-400 line-through'
                  }`}>
                    {feature.name} - {feature.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Prompt */}
        {upgradeParam && upgradeParam !== currentPlan && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Upgrade Required
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You need to upgrade to {PLANS[upgradeParam].name} to access this feature.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Switcher */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <PlanSwitcher 
            currentPlan={currentPlan} 
            onPlanChange={handlePlanChange}
          />
        </div>

        {/* Billing History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Billing History
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Download All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {invoice.plan}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {invoice.period}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      ${invoice.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {invoice.status === 'paid' ? (
                          <CheckCircleIcon className="w-3 h-3" />
                        ) : (
                          <ClockIcon className="w-3 h-3" />
                        )}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Method
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Update
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                •••• •••• •••• 4242
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Expires 12/26
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
