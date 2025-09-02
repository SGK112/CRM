'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { PageHeader } from '@/components/ui/PageHeader';
import PlanSwitcher from '@/components/PlanSwitcher';
import { CapabilityGate, PlanBadge } from '@/components/CapabilityGate';
import { getUserPlan, setUserPlan, PLANS, type PlanTier } from '@/lib/plans';
import {
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// Mock billing history data
const billingHistory = [
  {
    id: '1',
    date: '2024-01-01',
    plan: 'AI Professional',
    period: 'Jan 2024 - Feb 2024',
    amount: 49,
    status: 'paid' as const,
  },
  {
    id: '2',
    date: '2023-12-01',
    plan: 'AI Professional',
    period: 'Dec 2023 - Jan 2024',
    amount: 49,
    status: 'paid' as const,
  },
  {
    id: '3',
    date: '2023-11-01',
    plan: 'Basic',
    period: 'Nov 2023 - Dec 2023',
    amount: 0,
    status: 'paid' as const,
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('basic');
  const [showPlanSwitcher, setShowPlanSwitcher] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const searchParams = useSearchParams();

  const success = searchParams.get('success');
  const newPlan = searchParams.get('plan') as PlanTier;
  const upgradeParam = searchParams.get('upgrade') as PlanTier;

  useEffect(() => {
    const plan = getUserPlan();
    setCurrentPlan(plan);

    // Handle successful upgrade
    if (success === 'true' && newPlan) {
      setUserPlan(newPlan);
      setCurrentPlan(newPlan);

      // Show success message
      const planName = PLANS[newPlan]?.name || newPlan;
      alert(`🎉 Welcome to ${planName}! Your subscription is now active.`);

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/settings/billing');
    }
  }, [success, newPlan]);

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert('Unable to access billing portal. Please contact support.');
      }
    } catch (error) {
      alert('Failed to open billing portal. Please try again.');
    }
  };

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
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Manage Billing
              </button>
            </div>
          }
        />

        {/* Upgrade Prompt */}
        {upgradeParam && upgradeParam !== currentPlan && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Upgrade to {PLANS[upgradeParam].name}
                </h4>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  You need to upgrade to access this feature and unlock powerful AI-driven
                  capabilities.
                </p>
                <button
                  onClick={() => (window.location.href = `/dashboard/upgrade?plan=${upgradeParam}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade Now
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Plan: {planData.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{planData.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${planData.price}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per {planData.period}</div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                12 /{' '}
                {planData.capabilities['limits.clients'] === -1
                  ? '∞'
                  : planData.capabilities['limits.clients']}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                8 /{' '}
                {planData.capabilities['limits.projects'] === -1
                  ? '∞'
                  : planData.capabilities['limits.projects']}
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
                {currentPlan === 'basic'
                  ? '0 / 0'
                  : planData.capabilities['limits.ai_requests'] === -1
                    ? '1,247 / ∞'
                    : `1,247 / ${planData.capabilities['limits.ai_requests']}`}
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {planData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircleIcon
                    className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm ${
                      feature.included
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 line-through'
                    }`}
                  >
                    {feature.name} - {feature.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Switcher */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <PlanSwitcher currentPlan={currentPlan} onPlanChange={handlePlanChange} />
        </div>

        {/* Billing History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing History</h3>
            <button
              onClick={handleManageBilling}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Invoices
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Period
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map(invoice => (
                  <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{invoice.plan}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{invoice.period}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      ${invoice.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {invoice.status === 'paid' ? (
                          <CheckCircleIcon className="w-3 h-3" />
                        ) : (
                          <ClockIcon className="w-3 h-3" />
                        )}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={handleManageBilling}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h3>
            <button
              onClick={handleManageBilling}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Update
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
              <CreditCardIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expires 12/26</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
