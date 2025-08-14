'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const trialFeatures = [
  'Full access to all CRM features',
  'Project management tools',
  'Client relationship management',
  'Team collaboration features',
  'Mobile app access',
  'Email and SMS notifications',
  'Document storage (5GB)',
  'Basic reporting and analytics',
  'Email support',
  'No setup fees'
]

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
      'Email support'
    ],
    popular: false
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
      'API access'
    ],
    popular: true
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
      'Dedicated account manager'
    ],
    popular: false
  }
]

export default function FreeTrialPage() {
  const [selectedPlan, setSelectedPlan] = useState('Professional')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">Remodely CRM</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/demo"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Demo
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Start Your Free 14-Day Trial
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              No credit card required. Full access to all features. Cancel anytime.
              See why construction professionals choose Remodely CRM.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-6 w-6 text-green-400 mr-2" />
                <span className="text-sm">No Credit Card Required</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-green-400 mr-2" />
                <span className="text-sm">14 Days Free</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-green-400 mr-2" />
                <span className="text-sm">5,000+ Happy Customers</span>
              </div>
            </div>

            <Link
              href="/auth/register"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center"
            >
              Start Free Trial Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Get Started
            </h2>
            <p className="text-lg text-gray-600">
              Your free trial includes all features with no limitations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {trialFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan After Trial
            </h2>
            <p className="text-lg text-gray-600">
              Start free, then pick the plan that fits your business size
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {selectedPlan === plan.name ? 'Selected Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              All plans include a 14-day free trial. No credit card required to start.
            </p>
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center"
            >
              Start Your Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the free trial work?
              </h3>
              <p className="text-gray-600">
                You get full access to all Remodely CRM features for 14 days. No credit card required. 
                You can cancel anytime during the trial period with no charges.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-600">
                After your 14-day trial, you can choose a paid plan to continue using Remodely CRM. 
                If you don't upgrade, your account will be paused but your data will be saved for 30 days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and billing is prorated based on your usage.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade security with 256-bit SSL encryption, regular backups, 
                and comply with industry security standards to keep your data safe.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer customer support?
              </h3>
              <p className="text-gray-600">
                Yes! All plans include customer support. Starter plans get email support, while Professional 
                and Enterprise plans get priority and phone support respectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Streamline Your Construction Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of construction professionals using Remodely CRM
            </p>
            <Link
              href="/auth/register"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-medium inline-flex items-center"
            >
              Start Your Free 14-Day Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-sm text-blue-200 mt-4">
              No credit card required • Cancel anytime • Full feature access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
