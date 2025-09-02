'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PLANS, getUserPlan, type PlanTier, type Plan } from '@/lib/plans';
import {
  CheckIcon,
  SparklesIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function UpgradePage() {
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('basic');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('ai-pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const searchParams = useSearchParams();
  const router = useRouter();

  const upgradeParam = searchParams.get('plan') as PlanTier;

  useEffect(() => {
    const plan = getUserPlan();
    setCurrentPlan(plan);

    if (upgradeParam && upgradeParam !== plan) {
      setSelectedPlan(upgradeParam);
    } else if (plan === 'basic') {
      setSelectedPlan('ai-pro');
    } else if (plan === 'ai-pro') {
      setSelectedPlan('enterprise');
    }
  }, [upgradeParam]);

  const getPriceId = (planId: PlanTier, cycle: 'monthly' | 'yearly') => {
    // Use the actual price IDs from our Stripe setup
    const priceIds: Record<string, { monthly: string; yearly: string }> = {
      'ai-pro': {
        monthly: 'price_1QYfgjJ4XeFTAGVUVmtLVWJ8',
        yearly: 'price_1QYfgjJ4XeFTAGVUVmtLVWJ8', // Same for now, adjust if yearly is different
      },
      enterprise: {
        monthly: 'price_1QYfhCJ4XeFTAGVUYA7n3DaQ',
        yearly: 'price_1QYfhCJ4XeFTAGVUYA7n3DaQ', // Same for now, adjust if yearly is different
      },
    };

    return priceIds[planId]?.[cycle];
  };

  const handleUpgrade = async (planId: PlanTier) => {
    if (planId === 'basic') {
      router.push('/dashboard');
      return;
    }

    setIsProcessing(true);

    try {
      const priceId = getPriceId(planId, billingCycle);
      if (!priceId) {
        throw new Error('Invalid plan configuration');
      }

      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail: 'test@example.com', // In production, get from user context
          workspaceName: 'Test Workspace',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create checkout session: ${errorData}`);
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to start upgrade process: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentPrice = (plan: Plan) => {
    if (billingCycle === 'yearly') {
      return Math.round((plan.price * 12 * 0.8) / 12); // 20% discount
    }
    return plan.price;
  };

  const getYearlySavings = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.2);
  };

  const getPlanIcon = (planId: PlanTier) => {
    switch (planId) {
      case 'basic':
        return ShieldCheckIcon;
      case 'ai-pro':
        return SparklesIcon;
      case 'enterprise':
        return StarIcon;
      default:
        return ShieldCheckIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-First Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Upgrade Your Plan
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Choose the plan that fits your business needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Mobile-Friendly Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex w-full max-w-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                20%
              </span>
            </button>
          </div>
        </div>

        {/* Mobile-First Plans Grid */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 mb-12">
          {Object.values(PLANS).map(plan => {
            const Icon = getPlanIcon(plan.id);
            const isSelected = selectedPlan === plan.id;
            const isCurrent = currentPlan === plan.id;
            const currentPrice = getCurrentPrice(plan);
            const yearlySavings = getYearlySavings(plan.price);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 bg-white dark:bg-gray-800 border-2 transition-all ${
                  isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'
                } ${plan.popular ? 'ring-2 ring-blue-100 dark:ring-blue-900/30' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge - moved inside card */}
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Current
                    </span>
                  </div>
                )}

                {/* Plan Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.id === 'basic'
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : plan.id === 'ai-pro'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        plan.id === 'basic'
                          ? 'text-gray-600 dark:text-gray-400'
                          : plan.id === 'ai-pro'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-purple-600 dark:text-purple-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>

                {/* Plan Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm leading-relaxed">
                  {plan.description}
                </p>

                {/* Pricing */}
                <div className="text-center mb-6">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">Free</div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${currentPrice}
                        <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                          /mo
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                          Save ${yearlySavings}/year
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {typeof feature === 'string' ? feature : feature.description}
                      </span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-gray-500 dark:text-gray-400 text-sm text-center pt-2">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>

                {/* Action Button */}
                <div className="mt-auto">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium text-base"
                    >
                      Current Plan
                    </button>
                  ) : plan.price === 0 ? (
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      Continue Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isProcessing}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-base transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Processing...
                        </span>
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile-Friendly FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                immediately.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We accept all major credit cards, debit cards, and ACH bank transfers via Stripe.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                Is there a free trial?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Yes! All paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                What happens to my data if I downgrade?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Your data is always safe. Some features may be limited, but you never lose your
                information.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-Friendly Contact Sales */}
        <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Need a custom solution?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
            Our enterprise team can help you build a custom solution for your specific business
            needs.
          </p>
          <button
            onClick={() => router.push('/contact?inquiry=enterprise')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium text-base"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
