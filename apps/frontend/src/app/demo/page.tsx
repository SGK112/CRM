'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  PlayIcon, 
  ArrowRightIcon,
  ChevronRightIcon,
  CheckIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const demoSteps = [
  {
    id: 'dashboard',
    title: 'Professional Dashboard',
    description: 'Get a complete overview of your construction business with real-time stats, project progress, and recent activities.',
    image: '/demo/dashboard-overview.png',
    features: [
      'Real-time project stats',
      'Revenue tracking',
      'Team performance metrics',
      'Recent activity feed'
    ],
    tooltips: [
      { x: 20, y: 15, text: 'Quick stats show your business health at a glance' },
      { x: 60, y: 30, text: 'Project progress charts help track completion' },
      { x: 15, y: 70, text: 'Recent activities keep you updated on team work' }
    ]
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Manage all your construction projects from planning to completion with integrated timeline tracking.',
    image: '/demo/projects-view.png',
    features: [
      'Project timeline management',
      'Budget tracking',
      'Team assignment',
      'Document storage'
    ],
    tooltips: [
      { x: 25, y: 20, text: 'Create new projects with detailed specifications' },
      { x: 70, y: 45, text: 'Track budget vs actual costs in real-time' },
      { x: 40, y: 75, text: 'Assign team members and track their progress' }
    ]
  },
  {
    id: 'clients',
    title: 'Client Management',
    description: 'Keep detailed records of all your clients with communication history and project associations.',
    image: '/demo/clients-view.png',
    features: [
      'Contact management',
      'Communication history',
      'Project associations',
      'Business card scanner'
    ],
    tooltips: [
      { x: 30, y: 25, text: 'Store comprehensive client information' },
      { x: 65, y: 40, text: 'Track all interactions and communications' },
      { x: 20, y: 65, text: 'Link clients to their active projects' }
    ]
  },
  {
    id: 'ecommerce',
    title: 'Online Store Integration',
    description: 'Connect your Shopify store and manage products, orders, and inventory directly from your CRM.',
    image: '/demo/ecommerce-integration.png',
    features: [
      'Shopify integration',
      'Product management',
      'Order tracking',
      'Inventory sync'
    ],
    tooltips: [
      { x: 35, y: 20, text: 'Connect multiple online stores' },
      { x: 60, y: 50, text: 'Sync products and pricing automatically' },
      { x: 25, y: 70, text: 'Track orders and fulfillment status' }
    ]
  }
]

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [showTooltips, setShowTooltips] = useState(true)

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
                href="/auth/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              See Remodely CRM in Action
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Take a guided tour of our construction CRM platform. Discover how it can streamline 
              your business operations and boost productivity.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center">
                <PlayIcon className="mr-2 h-5 w-5" />
                Start Interactive Demo
              </button>
              <Link
                href="/auth/register"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Steps Navigation */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {demoSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeStep === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeStep === index ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <span className="font-medium">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {demoSteps[activeStep].title}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {demoSteps[activeStep].description}
            </p>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features:</h3>
              <ul className="space-y-2">
                {demoSteps[activeStep].features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-4">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {activeStep < demoSteps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  Next Step
                  <ChevronRightIcon className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/auth/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  Start Your Free Trial
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Screenshot with Tooltips */}
          <div className="relative">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {/* Mock Screenshot */}
              <div className="relative h-96 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {activeStep === 0 && <ChartBarIcon className="h-8 w-8 text-white" />}
                    {activeStep === 1 && <CalendarIcon className="h-8 w-8 text-white" />}
                    {activeStep === 2 && <UserGroupIcon className="h-8 w-8 text-white" />}
                    {activeStep === 3 && <CogIcon className="h-8 w-8 text-white" />}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {demoSteps[activeStep].title} Preview
                  </h3>
                  <p className="text-sm text-gray-600">
                    Interactive demo screenshot will be displayed here
                  </p>
                </div>

                {/* Tooltips */}
                {showTooltips && demoSteps[activeStep].tooltips.map((tooltip, index) => (
                  <div
                    key={index}
                    className="absolute bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs"
                    style={{ 
                      left: `${tooltip.x}%`, 
                      top: `${tooltip.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="relative">
                      {tooltip.text}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Tooltips */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowTooltips(!showTooltips)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showTooltips ? 'Hide Tooltips' : 'Show Tooltips'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Construction Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of construction professionals who have streamlined their operations with Remodely CRM.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-medium"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="/auth/login"
                className="border border-white text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <StarIcon key={starIndex} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Remodely CRM has completely transformed how we manage our construction projects. 
                  The interface is intuitive and the features are exactly what we needed."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-gray-900">John Smith</p>
                    <p className="text-sm text-gray-600">ABC Construction</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
