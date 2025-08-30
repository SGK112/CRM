'use client';

import { RevealInit } from '@/components/RevealInit'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  CalendarDaysIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  MicrophoneIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

// Core CRM features - simplified and professional
const coreFeatures = [
  { 
    icon: ClipboardDocumentListIcon, 
    title: 'Project Management', 
    description: 'Track projects from estimate to completion with professional workflows.'
  },
  { 
    icon: UserGroupIcon, 
    title: 'Client Management', 
    description: 'Organize client information, communication history, and project details.'
  },
  { 
    icon: DocumentTextIcon, 
    title: 'Estimates & Invoicing', 
    description: 'Create professional estimates and invoices with Arizona tax compliance.'
  },
  { 
    icon: CalendarDaysIcon, 
    title: 'Scheduling', 
    description: 'Coordinate jobs, meetings, and team schedules in one calendar.'
  },
  { 
    icon: MicrophoneIcon, 
    title: 'AI Voice Assistant', 
    description: 'Sarah calls leads, qualifies prospects, and books appointments automatically.'
  },
  { 
    icon: ChartBarIcon, 
    title: 'Analytics & Reports', 
    description: 'Track business performance with real-time insights and reporting.'
  }
]

const businessPillars = [
  { 
    label: 'Organize', 
    icon: CogIcon,
    color: 'blue',
    points: ['Project tracking', 'Client management', 'Document storage', 'Team coordination']
  },
  { 
    label: 'Grow', 
    icon: ChartBarIcon,
    color: 'amber', 
    points: ['Lead management', 'Sales pipeline', 'Performance metrics', 'Business insights']
  },
  { 
    label: 'Automate', 
    icon: MicrophoneIcon,
    color: 'emerald',
    points: ['AI voice calls', 'Automated follow-ups', 'Smart scheduling', 'Quote generation']
  }
]

// Beta testimonials - Real but limited for development stage
const testimonials = [
  {
    name: "Mike Rodriguez",
    company: "Desert Sun Construction",
    role: "General Contractor - Phoenix",
    image: "/testimonials/mike.jpg",
    content: "Testing Remodely CRM for our Phoenix projects. The mobile-first approach is exactly what we need for Arizona job sites.",
    rating: 5,
    metrics: { stage: "Beta Tester", location: "Phoenix, AZ", focus: "General Construction" }
  },
  {
    name: "Sarah Chen",
    company: "Arizona Kitchen Pros", 
    role: "Kitchen Specialist - Scottsdale",
    image: "/testimonials/sarah.jpg",
    content: "Being part of the beta program has been great. The app works perfectly for our Scottsdale kitchen remodeling projects.",
    rating: 5,
    metrics: { stage: "Beta Tester", location: "Scottsdale, AZ", focus: "Kitchen Remodeling" }
  },
  {
    name: "David Thompson",
    company: "Valley Pool & Landscape",
    role: "Pool Construction - Tempe",
    image: "/testimonials/david.jpg", 
    content: "As a beta tester, I love how Remodely CRM handles our pool construction workflow. Perfect for Arizona's outdoor living market.",
    rating: 5,
    metrics: { stage: "Beta Tester", location: "Tempe, AZ", focus: "Pool & Outdoor Living" }
  }
]

const pricingPlans = [
    {
      name: "Starter",
      price: { monthly: 29, yearly: 24 },
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 users",
        "100 clients",
        "Basic project management",
        "Email support",
        "Mobile app access",
        "Basic reporting"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: { monthly: 59, yearly: 49 },
      description: "For growing teams with advanced needs",
      features: [
        "Up to 25 users",
        "500 clients",
        "Advanced project management",
        "Priority support",
        "AI voice assistant",
        "Custom integrations",
        "Advanced analytics",
        "Document management"
      ],
      popular: true
    },
    {
      name: "Scale",
      price: { monthly: 99, yearly: 79 },
      description: "For large companies with complex projects",
      features: [
        "Unlimited users",
        "Unlimited clients",
        "White-label solution",
        "24/7 phone support",
        "Custom development",
        "Advanced security",
        "API access",
        "Dedicated account manager"
      ],
      popular: false
    }
  ]

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen text-[var(--text)]">
      <RevealInit />
      
      {/* Professional Landing Navigation - Clean Design */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Remodely CRM
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[var(--text-dim)] hover:text-amber-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-[var(--text-dim)] hover:text-amber-600 transition-colors font-medium">Pricing</a>
              <a href="/contact" className="text-[var(--text-dim)] hover:text-amber-600 transition-colors font-medium">Contact</a>
              <Link href="/auth/login" className="text-[var(--text-dim)] hover:text-amber-600 transition-colors font-medium">Sign In</Link>
              <Link href="/auth/register" className="btn btn-amber shadow-soft text-sm px-4 py-2">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link href="/auth/register" className="btn btn-amber shadow-soft text-sm px-4 py-2">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content with top padding */}
      <div className="pt-16">
      
      {/* Background elements */}
      <div className="pointer-events-none select-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />
      
      {/* Hero Section - Mobile First */}
      <section className="relative z-10 px-4 py-12 sm:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Mobile-first badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600/10 border border-amber-500/30 rounded-full mb-4 sm:mb-6">
            <DevicePhoneMobileIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">Mobile-First Construction CRM</span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Your Construction Business
            <br />
            <span className="gradient-amber">In Your Pocket</span>
          </h1>
          
          {/* Subheadline - Arizona focused */}
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--text-dim)] mb-6 sm:mb-8 leading-relaxed">
            Arizona's premier construction CRM. Manage projects, estimates, and client communication 
            from Phoenix to Tucson and everywhere in between.
          </p>

          {/* Mobile-first CTA stack - Centered Design */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8 sm:mb-12 max-w-md mx-auto">
            <Link href="/auth/register" className="btn btn-amber shadow-glow professional-shine text-base sm:text-lg px-8 py-4 w-full text-center">
              Start Free Trial
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Link href="/contact" className="btn btn-outline text-base px-6 py-3 hover:border-amber-500/60 hover:text-amber-300 transition flex items-center justify-center">
                <UserGroupIcon className="mr-2 h-4 w-4" />
                Talk to Sales
              </Link>
              <Link href="/auth/login" className="btn btn-outline text-base px-6 py-3 hover:border-amber-500/60 hover:text-amber-300 transition flex items-center justify-center">
                <ArrowRightIcon className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>

      {/* Professional trust indicators - Arizona focus */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-[var(--text-dim)] mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="h-4 w-4 text-amber-500 fill-current" />
            ))}
          </div>
          <span className="font-medium">Built for Arizona Contractors</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
          <span>No Credit Card Required</span>
        </div>
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-4 w-4 text-blue-500" />
          <span>Free 30-Day Trial</span>
        </div>
      </div>          {/* Enhanced Mobile app preview mockup */}
          <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-lg">
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-2 shadow-2xl ring-1 ring-slate-700/50">
              <div className="bg-[var(--bg)] rounded-2xl overflow-hidden shadow-inner">
                {/* Mock phone status bar */}
                <div className="bg-black text-white text-xs py-2 px-4 flex justify-between items-center">
                  <span className="font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                    </div>
                    <div className="w-6 h-3 border border-white rounded-sm relative ml-1">
                      <div className="absolute inset-0.5 bg-white rounded-sm"></div>
                      <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Mock app interface */}
                <div className="p-4 space-y-4 bg-gradient-to-b from-[var(--surface-1)] to-[var(--bg)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Today's Projects</h3>
                    <span className="text-amber-600 font-medium text-sm bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">3 active</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)] shadow-soft card-hover">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-sm">Kitchen Remodel - Johnson</span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full font-medium">In Progress</span>
                      </div>
                      <p className="text-xs text-[var(--text-dim)] mb-2">Est. completion: 3 days</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[var(--surface-2)] rounded-xl p-4 border border-[var(--border)] shadow-soft card-hover">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-sm">Bathroom Renovation - Smith</span>
                        <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full font-medium">Estimate Sent</span>
                      </div>
                      <p className="text-xs text-[var(--text-dim)]">Waiting for approval • $24,500</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm py-3 px-4 rounded-lg font-semibold shadow-soft hover:shadow-glow transition-all">
                      New Estimate
                    </button>
                    <button className="border border-[var(--border)] text-sm py-3 px-4 rounded-lg font-semibold hover:border-amber-500/50 hover:text-amber-600 transition-all bg-white dark:bg-[var(--surface-1)]">
                      View Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Trust Badges - Arizona Development Stage */}
      <section className="py-8 sm:py-12 bg-[var(--surface-1)] border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Currently Serving Arizona Contractors
            </h3>
            <p className="text-sm text-[var(--text-dim)]">Development stage - launching across Arizona first</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center max-w-4xl mx-auto">
            {/* Development indicators */}
            <div className="text-center">
              <div className="text-amber-600 font-bold text-lg mb-1">🚀</div>
              <div className="text-sm font-semibold">Beta Testing</div>
              <div className="text-xs text-[var(--text-dim)]">Arizona Contractors</div>
            </div>
            
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-lg mb-1">🏗️</div>
              <div className="text-sm font-semibold">Construction Focused</div>
              <div className="text-xs text-[var(--text-dim)]">Built for Arizona's Market</div>
            </div>
            
            <div className="text-center">
              <div className="text-blue-600 font-bold text-lg mb-1">📱</div>
              <div className="text-sm font-semibold">Mobile First</div>
              <div className="text-xs text-[var(--text-dim)]">On-site Ready</div>
            </div>
            
            <div className="text-center">
              <div className="text-emerald-600 font-bold text-lg mb-1">✓</div>
              <div className="text-sm font-semibold">Free During Beta</div>
              <div className="text-xs text-[var(--text-dim)]">No Credit Card</div>
            </div>
          </div>
        </div>
      </section>

      {/* Arizona Market Metrics Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
            Built for <span className="gradient-amber">Arizona's Construction Market</span>
          </h2>
          <p className="text-lg text-[var(--text-dim)] mb-8 sm:mb-12">
            From Phoenix's rapid growth to Tucson's established market
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-amber-600 mb-2">☀️</div>
              <div className="text-sm sm:text-base text-[var(--text-dim)]">Year-Round Construction</div>
              <div className="text-xs text-[var(--text-dim)] mt-1">Arizona's 300+ sunny days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">🏗️</div>
              <div className="text-sm sm:text-base text-[var(--text-dim)]">Rapid Growth Market</div>
              <div className="text-xs text-[var(--text-dim)] mt-1">Phoenix metro expansion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">📱</div>
              <div className="text-sm sm:text-base text-[var(--text-dim)]">Mobile-First Solution</div>
              <div className="text-xs text-[var(--text-dim)] mt-1">Built for on-site work</div>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-[var(--text-dim)]">
            Currently in development - accepting beta contractors in Arizona
          </div>
        </div>
      </section>

      {/* Business Pillars - Enhanced Grid Design */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-amber">Run, Grow & Automate</span> Your Arizona Construction Business
            </h2>
            <p className="text-xl text-[var(--text-dim)] max-w-3xl mx-auto">
              Three core pillars designed specifically for Arizona's construction market and climate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {businessPillars.map((pillar, index) => {
              const getColorClasses = (color: string) => {
                const colorMap = {
                  blue: { bg: 'bg-blue-600/15', ring: 'ring-blue-500/30', text: 'text-blue-600', gradient: 'from-blue-500/10 to-blue-600/20' },
                  amber: { bg: 'bg-amber-600/15', ring: 'ring-amber-500/30', text: 'text-amber-600', gradient: 'from-amber-500/10 to-amber-600/20' },
                  emerald: { bg: 'bg-emerald-600/15', ring: 'ring-emerald-500/30', text: 'text-emerald-600', gradient: 'from-emerald-500/10 to-emerald-600/20' }
                };
                return colorMap[color as keyof typeof colorMap] || colorMap.amber;
              };
              const colors = getColorClasses(pillar.color);
              
              return (
              <div key={index} className={`text-center p-8 lg:p-10 rounded-2xl bg-gradient-to-br ${colors.gradient} border border-[var(--border)] hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mb-6 ${colors.bg} ring-1 ${colors.ring}`}>
                  <pillar.icon className={`h-8 w-8 lg:h-10 lg:w-10 ${colors.text}`} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-6">{pillar.label}</h3>
                <ul className="space-y-3">
                  {pillar.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-3 text-[var(--text-dim)]">
                      <CheckIcon className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-left">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features - Clean and Simple */}
      <section id="features" className="py-12 sm:py-20 bg-[var(--surface-1)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Everything You Need to <span className="gradient-amber">Run Your Business</span>
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-dim)] max-w-3xl mx-auto">
              Professional construction CRM built specifically for Arizona contractors.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[var(--bg)] to-[var(--surface-2)] border border-[var(--border)] hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-4 sm:mb-6 transition-all duration-300 group-hover:bg-amber-600/25 group-hover:scale-110">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-3">{feature.title}</h3>
                <p className="text-[var(--text-dim)] text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Arizona Construction Trades */}
      <section className="py-12 sm:py-20 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Arizona Construction <span className="gradient-amber">Trade Specializations</span>
            </h2>
            <p className="text-lg text-[var(--text-dim)] max-w-2xl mx-auto">
              Customized workflows for Arizona's most in-demand construction trades and services.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {[
              { name: "Pool Construction", icon: "�‍♂️", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
              { name: "Solar Installation", icon: "☀️", color: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
              { name: "HVAC & Cooling", icon: "❄️", color: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800" },
              { name: "Outdoor Living", icon: "🌵", color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
              { name: "Kitchen Remodeling", icon: "🍳", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
              { name: "Bathroom Renovation", icon: "🛁", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
              { name: "Roofing & Tiles", icon: "🏠", color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
              { name: "Flooring", icon: "🪵", color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
              { name: "Landscaping", icon: "�", color: "bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800" },
              { name: "Plumbing", icon: "🔧", color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800" },
              { name: "Electrical", icon: "⚡", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" },
              { name: "General Contractor", icon: "🏗️", color: "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800" }
            ].map((trade, index) => (
              <div key={index} className={`${trade.color} rounded-2xl p-4 sm:p-6 border text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group`}>
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 transition-transform group-hover:scale-110">{trade.icon}</div>
                <div className="text-sm sm:text-base font-medium text-[var(--text)]">{trade.name}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="text-sm text-[var(--text-dim)] mb-4">
              Specializing in Arizona's unique construction needs and climate requirements
            </div>
            <Link href="/contact" className="btn btn-amber px-6 py-3 text-base">
              Get Started in Arizona
            </Link>
          </div>
        </div>
      </section>

      {/* Arizona Beta Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Arizona <span className="gradient-amber">Beta Contractors</span>
            </h2>
            <p className="text-xl text-[var(--text-dim)]">
              Early feedback from Arizona construction professionals testing our platform
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Professional testimonial card with Arizona focus */}
            <div className="bg-white dark:bg-[var(--surface-1)] rounded-2xl p-6 sm:p-8 lg:p-12 border border-[var(--border)] shadow-soft">
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-center">
                {/* Testimonial Content */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-medium">BETA TESTER</span>
                  </div>
                  <blockquote className="text-lg sm:text-xl font-medium mb-6 leading-relaxed">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{testimonials[activeTestimonial].name}</div>
                      <div className="text-[var(--text-dim)] text-sm">{testimonials[activeTestimonial].company}</div>
                      <div className="text-[var(--text-dim)] text-xs uppercase tracking-wide">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </div>

                {/* Beta Info Panel */}
                <div className="bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] rounded-xl p-6 border border-[var(--border)]">
                  <div className="space-y-4">
                    {Object.entries(testimonials[activeTestimonial].metrics).map(([key, value], index) => (
                      <div key={index} className="text-center">
                        <div className="text-base sm:text-lg font-bold text-amber-600 mb-1">{value}</div>
                        <div className="text-xs sm:text-sm text-[var(--text-dim)] capitalize">
                          {key === 'stage' ? 'Program Status' : key === 'location' ? 'Location' : key === 'focus' ? 'Specialization' : key}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional navigation dots */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? 'bg-amber-600 scale-125' : 'bg-[var(--border)] hover:bg-amber-600/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Beta Pricing - Development Stage */}
      <section id="pricing" className="py-12 sm:py-20 bg-[var(--surface-1)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              <span className="gradient-amber">Beta Program</span> Pricing
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-dim)] mb-6 sm:mb-8">
              Currently offering beta access to Arizona contractors
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-600 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              🚀 Free during beta testing phase
            </div>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative p-6 sm:p-8 rounded-2xl border transition-all hover:shadow-lg ${
                plan.popular 
                  ? 'bg-amber-600/5 border-amber-500/50 ring-2 ring-amber-500/20' 
                  : 'bg-[var(--bg)] border-[var(--border)]'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-[var(--text-dim)] text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-3xl sm:text-4xl font-bold line-through text-[var(--text-dim)] opacity-50">
                      ${plan.price.monthly}
                    </span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">FREE</div>
                    <span className="text-[var(--text-dim)] text-sm">during beta</span>
                  </div>
                  <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full inline-block">
                    Arizona Beta Program
                  </div>
                </div>

                <ul className="space-y-3 mb-6 text-sm">
                  {plan.features.slice(0, 6).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--text-dim)]">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="text-xs text-[var(--text-dim)] font-medium">
                      +{plan.features.length - 6} more features
                    </li>
                  )}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors text-sm ${
                    plan.popular
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'border border-[var(--border)] hover:border-amber-500/50 hover:text-amber-600'
                  }`}
                >
                  Join Beta Program
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs sm:text-sm text-[var(--text-dim)]">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 text-emerald-500" />
                <span>Free during beta testing</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                <span>Arizona contractors only</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-emerald-500" />
                <span>Help shape the product</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arizona Final CTA - Centered Design */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-amber-600/10 to-amber-500/5 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-amber-500/20 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Transform Your <span className="gradient-amber">Arizona Construction Business?</span>
            </h2>
            <p className="text-lg sm:text-xl text-[var(--text-dim)] mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join our exclusive beta program for Arizona contractors and help shape the future of construction CRM.
            </p>
            
            <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8 max-w-md mx-auto">
              <Link href="/auth/register" className="btn btn-amber shadow-glow professional-shine text-base sm:text-lg px-8 py-4 w-full text-center">
                Join Arizona Beta Program
                <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link href="/contact" className="btn btn-outline text-base px-8 py-3 hover:border-amber-500/60 hover:text-amber-300 transition w-full text-center">
                <UserGroupIcon className="mr-2 h-4 w-4" />
                Schedule a Demo
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-[var(--text-dim)]">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                <span>Free during beta</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ClockIcon className="h-4 w-4 text-emerald-500" />
                <span>Arizona contractors only</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <UserGroupIcon className="h-4 w-4 text-emerald-500" />
                <span>Help shape the product</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div> {/* Close pt-16 container */}
    </div>
  );
}
