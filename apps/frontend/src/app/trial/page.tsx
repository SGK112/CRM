'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  ChatBubbleBottomCenterTextIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon
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

const testimonials = [
  {
    name: 'Sarah Chen',
    company: 'Premier Construction LLC',
    role: 'Project Manager',
    location: 'Austin, TX',
    image: '/api/placeholder/80/80',
    rating: 5,
    text: 'Remodely CRM transformed how we manage our construction projects. We\'ve increased our efficiency by 40% and our client satisfaction scores have never been higher.',
    projectsManaged: 127,
    savings: '$89,000'
  },
  {
    name: 'Mike Rodriguez',
    company: 'Rodriguez Home Builders',
    role: 'CEO',
    location: 'Phoenix, AZ',
    image: '/api/placeholder/80/80',
    rating: 5,
    text: 'The scheduling and client communication features alone have saved us countless hours. Our team can focus on what they do best - building amazing homes.',
    projectsManaged: 89,
    savings: '$62,000'
  },
  {
    name: 'Jennifer Walsh',
    company: 'Coastal Remodeling Co.',
    role: 'Operations Director',
    location: 'San Diego, CA',
    image: '/api/placeholder/80/80',
    rating: 5,
    text: 'We went from chaos to complete organization in just 2 weeks. The ROI calculator showed we recovered our investment in the first month.',
    projectsManaged: 156,
    savings: '$124,000'
  }
]

const keyFeatures = [
  {
    icon: CalendarIcon,
    title: 'Smart Scheduling',
    description: 'AI-powered scheduling that prevents conflicts and optimizes your team\'s time',
    benefits: ['Reduces scheduling conflicts by 90%', 'Automatic reminders', 'Mobile calendar sync']
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Client Communication Hub',
    description: 'Centralized communication keeps clients informed and projects on track',
    benefits: ['Real-time project updates', 'Automated status emails', 'Photo sharing']
  },
  {
    icon: DocumentTextIcon,
    title: 'Document Management',
    description: 'Organize contracts, permits, and blueprints in one secure location',
    benefits: ['Version control', 'Digital signatures', 'Cloud backup']
  },
  {
    icon: ChartBarIcon,
    title: 'Performance Analytics',
    description: 'Track profitability, timeline accuracy, and team performance',
    benefits: ['ROI tracking', 'Profit margin analysis', 'Performance dashboards']
  }
]

const comparisonData = [
  {
    feature: 'Project Management',
    remodely: 'Advanced project boards with timeline tracking',
    spreadsheets: 'Manual tracking prone to errors',
    competitors: 'Basic task lists'
  },
  {
    feature: 'Client Communication',
    remodely: 'Automated updates with photo sharing',
    spreadsheets: 'Email chaos and missed updates',
    competitors: 'Limited messaging features'
  },
  {
    feature: 'Cost Tracking',
    remodely: 'Real-time budget monitoring with alerts',
    spreadsheets: 'Static budgets, manual calculations',
    competitors: 'Basic expense tracking'
  },
  {
    feature: 'Mobile Access',
    remodely: 'Full-featured mobile app',
    spreadsheets: 'Poor mobile experience',
    competitors: 'Limited mobile functionality'
  }
]

const integrations = [
  { name: 'QuickBooks', logo: '/api/placeholder/40/40', description: 'Sync finances automatically' },
  { name: 'Google Calendar', logo: '/api/placeholder/40/40', description: 'Schedule appointments seamlessly' },
  { name: 'Stripe', logo: '/api/placeholder/40/40', description: 'Accept payments online' },
  { name: 'Gmail', logo: '/api/placeholder/40/40', description: 'Email integration' },
  { name: 'Twilio', logo: '/api/placeholder/40/40', description: 'SMS notifications' },
  { name: 'Cloudinary', logo: '/api/placeholder/40/40', description: 'Photo storage & sharing' }
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
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)

  // Show floating CTA after user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 800)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

      {/* Social Proof & Stats */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
              Trusted by 5,000+ Construction Professionals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">$2.4M+</div>
                <div className="text-sm text-gray-600">Revenue Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">15,000+</div>
                <div className="text-sm text-gray-600">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">45%</div>
                <div className="text-sm text-gray-600">Time Savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Construction Professionals Say
            </h2>
            <p className="text-lg text-gray-600">
              Real results from real businesses using Remodely CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {testimonial.location}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{testimonial.projectsManaged} Projects</div>
                    <div className="text-green-600 font-medium">{testimonial.savings} Saved</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features Built for Construction
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to run your construction business efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Remodely CRM?
            </h2>
            <p className="text-lg text-gray-600">
              See how we compare to spreadsheets and other solutions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                      Remodely CRM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spreadsheets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Other CRMs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                          {row.remodely}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {row.spreadsheets}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {row.competitors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See Remodely CRM in Action
            </h2>
            <p className="text-lg text-gray-600">
              Watch how construction teams use our platform to streamline operations
            </p>
          </div>

          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <div className="flex items-center justify-center h-96">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-6 transition-all">
                  <PlayIcon className="h-12 w-12 text-white ml-1" />
                </button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-xl font-semibold mb-2">3-Minute Product Tour</h3>
              <p className="text-gray-200">See how Remodely CRM transforms construction workflows</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/demo"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Try Interactive Demo
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seamlessly Integrate with Your Existing Tools
            </h2>
            <p className="text-lg text-gray-600">
              Connect with the tools you already use and love
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={integration.logo} 
                  alt={integration.name}
                  className="w-10 h-10 mx-auto mb-2"
                />
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {integration.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {integration.description}
                </p>
              </div>
            ))}
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

      {/* Risk Reversal & Urgency */}
      <div className="bg-white py-16 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Zero Risk. Maximum Reward.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credit Card Required</h3>
              <p className="text-gray-600 text-center">Start your trial instantly without any payment information</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">14 Days Free</h3>
              <p className="text-gray-600 text-center">Full access to all features with no limitations or restrictions</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 rounded-full p-4 mb-4">
                <PhoneIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Setup Help</h3>
              <p className="text-gray-600 text-center">Our team will help you get started and import your data</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-800">Limited Time: Save $500</h3>
            </div>
            <p className="text-yellow-800 text-center">
              Sign up this month and get your first 3 months for just $39/month (reg. $59). 
              <br />
              <span className="font-semibold">That's $500 in savings!</span>
            </p>
          </div>

          <div className="text-gray-600 mb-8">
            <p className="mb-2">
              <strong>What happens after my trial?</strong>
            </p>
            <p>
              After 14 days, you can choose a plan that fits your business. If you don't upgrade, 
              your account is simply paused - no charges, no cancellation fees, no hassle.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Construction Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join 5,000+ construction professionals who've increased efficiency by 45% with Remodely CRM
            </p>
            
            {/* Multiple CTA Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center transition-all transform hover:scale-105"
              >
                Start Free 14-Day Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                href="/demo"
                className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center transition-all"
              >
                Watch 3-Min Demo
                <PlayIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-blue-200 text-sm">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                No credit card required
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Setup in under 5 minutes
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                Free onboarding support
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-12 border-t border-blue-500 pt-8">
              <p className="text-blue-200 text-sm mb-4">Trusted by construction companies nationwide</p>
              <div className="flex flex-wrap justify-center items-center space-x-8">
                <div className="text-blue-200">
                  <BuildingOfficeIcon className="h-8 w-8 mx-auto mb-1" />
                  <div className="text-xs">500+ Companies</div>
                </div>
                <div className="text-blue-200">
                  <ChartBarIcon className="h-8 w-8 mx-auto mb-1" />
                  <div className="text-xs">$2.4M+ Managed</div>
                </div>
                <div className="text-blue-200">
                  <StarIcon className="h-8 w-8 mx-auto mb-1 fill-current" />
                  <div className="text-xs">4.9/5 Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA (Mobile/Scroll) */}
      {showFloatingCTA && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 md:hidden">
          <Link
            href="/auth/register"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center block transition-colors"
          >
            Start Free Trial - No Credit Card
          </Link>
        </div>
      )}
    </div>
  )
}
