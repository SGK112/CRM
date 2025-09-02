'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, Zap, Lock, ArrowUpRight } from 'lucide-react';
import { PLANS, getUserPlan, setUserPlan, type PlanTier } from '@/lib/plans';

interface PlanSwitcherProps {
  currentPlan?: PlanTier;
  onPlanChange?: (plan: PlanTier) => void;
}

export default function PlanSwitcher({ currentPlan, onPlanChange }: PlanSwitcherProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(currentPlan || getUserPlan());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentPlan) {
      setSelectedPlan(currentPlan);
    }
  }, [currentPlan]);

  const handlePlanChange = async (planId: PlanTier) => {
    if (planId === 'basic') {
      // Handle downgrade to basic plan
      if (
        confirm(
          'Are you sure you want to downgrade to the Basic plan? You will lose access to premium features.'
        )
      ) {
        setIsLoading(true);

        try {
          // Cancel current subscription
          await fetch('/api/billing/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cancel' }),
          });

          localStorage.setItem('userPlan', planId);
          setSelectedPlan(planId);
          if (onPlanChange) onPlanChange(planId);
          alert(
            'Successfully downgraded to Basic plan. Your subscription will end at the current billing period.'
          );
        } catch (error) {
          alert('Failed to downgrade plan. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    // For paid plans, redirect to upgrade page with specific plan
    window.location.href = `/dashboard/upgrade?plan=${planId}`;
  };

  const getPlanIcon = (plan: PlanTier) => {
    switch (plan) {
      case 'basic':
        return Lock;
      case 'ai-pro':
        return Zap;
      case 'enterprise':
        return Crown;
      default:
        return Lock;
    }
  };

  const getPlanColor = (plan: PlanTier) => {
    switch (plan) {
      case 'basic':
        return 'border-gray-300 bg-gray-50 text-gray-800';
      case 'ai-pro':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'enterprise':
        return 'border-purple-300 bg-purple-50 text-purple-800';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your CRM Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select the plan that best fits your business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(PLANS).map(plan => {
          const Icon = getPlanIcon(plan.id);
          const isSelected = selectedPlan === plan.id;
          const isCurrent = getUserPlan() === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${plan.popular ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${getPlanColor(plan.id)}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{plan.description}</p>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        feature.included
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 line-through'
                      }`}
                    >
                      {feature.description}
                      {feature.limit && feature.included && (
                        <span className="text-gray-500"> ({feature.limit})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={isLoading || isCurrent}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isCurrent
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : isSelected
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                  </span>
                ) : isCurrent ? (
                  'Current Plan'
                ) : plan.price === 0 ? (
                  'Downgrade to Basic'
                ) : (
                  <>
                    Upgrade to {plan.name}
                    <ArrowUpRight className="w-4 h-4 inline ml-1" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>All plans include core CRM features. Upgrade anytime for advanced capabilities.</p>
        <p className="mt-1">
          Need enterprise features?{' '}
          <a href="mailto:sales@company.com" className="text-blue-600 hover:text-blue-700">
            Contact sales
          </a>
        </p>
      </div>
    </div>
  );
}
