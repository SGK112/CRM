'use client';

import { RevealInit } from '@/components/RevealInit';
import {
    ArrowRightIcon,
    Bars3Icon,
    BoltIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ChartBarIcon,
    CheckIcon,
    ClockIcon,
    CogIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    PhotoIcon,
    PlayIcon,
    RocketLaunchIcon,
    ShieldCheckIcon,
    SpeakerWaveIcon,
    StarIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Typing animation component
interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

function TypewriterText({ text, speed = 50, delay = 0, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed, started])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-amber-500">|</span>
      )}
    </span>
  )
}

// Features data
const coreFeatures = [
  {
    icon: UserGroupIcon,
    title: 'Client Management',
    description: 'Complete client profiles with contact history, project timeline, and communication logs.',
    benefits: ['360° client view', 'Communication tracking', 'Project history']
  },
  {
    icon: DocumentTextIcon,
    title: 'Estimates → Invoices',
    description: 'Transform estimates into invoices with one click. Track approvals and payments seamlessly.',
    benefits: ['One-click conversion', 'Payment tracking', 'Professional templates']
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Project Management',
    description: 'Manage multiple projects with timeline tracking, resource allocation, and team coordination.',
    benefits: ['Timeline tracking', 'Resource planning', 'Team collaboration']
  },
  {
    icon: CalendarIcon,
    title: 'Smart Scheduling',
    description: 'AI-powered scheduling prevents conflicts and optimizes your team\'s time automatically.',
    benefits: ['Conflict prevention', 'Auto-optimization', 'Team coordination']
  },
  {
    icon: SpeakerWaveIcon,
    title: 'AI Voice Agent',
    description: 'Sarah, your AI sales specialist, makes calls to prospects and schedules appointments 24/7.',
    benefits: ['24/7 availability', 'Natural conversations', 'Automatic scheduling']
  },
  {
    icon: PhotoIcon,
    title: 'Secure Media Sharing',
    description: 'Share project photos, blueprints, and documents with clients through secure, controlled links.',
    benefits: ['Secure sharing', 'Version control', 'Client access control']
  },
  {
    icon: ChartBarIcon,
    title: 'Business Analytics',
    description: 'Real-time insights into margins, pipeline, and performance metrics to grow your business.',
    benefits: ['Real-time metrics', 'Profit tracking', 'Growth insights']
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Usage-Based AI',
    description: 'Pay only for the AI features you use. No monthly AI fees - complete transparency.',
    benefits: ['Pay per use', 'Cost control', 'Full transparency']
  }
]

const businessPillars = [
  {
    label: 'Run',
    icon: CogIcon,
    color: 'blue',
    points: ['Centralize jobs & docs', 'Real-time margins', 'Fast estimating', 'Team coordination']
  },
  {
    label: 'Grow',
    icon: RocketLaunchIcon,
    color: 'amber',
    points: ['Sharable links', 'Faster approvals', 'Insight dashboards', 'Lead conversion']
  },
  {
    label: 'Automate',
    icon: BoltIcon,
    color: 'emerald',
    points: ['AI drafting', 'One-click conversion', 'Voice agent calls', 'Smart scheduling']
  }
]

const testimonials = [
  {
    name: "Mike Rodriguez",
    role: "Owner, Elite Remodeling",
    content: "Remodely transformed our business. We've increased our close rate by 40% and our team is more organized than ever.",
    rating: 5
  },
  {
    name: "Sarah Chen",
    role: "Project Manager, Coastal Construction",
    content: "The AI voice agent is incredible. It books appointments while I sleep and the voice quality is so natural clients think it's human.",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "CEO, Premium Granite Solutions",
    content: "From estimates to invoices in seconds. The pricing integration alone has saved us 10 hours per week.",
    rating: 5
  }
]

const stats = [
  { label: 'Construction Companies', value: '500+' },
  { label: 'Revenue Managed', value: '$2.4M+' },
  { label: 'Average Rating', value: '4.9/5' },
  { label: 'Time Saved Per Week', value: '15hrs' }
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
  const [isYearly, setIsYearly] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <BuildingOfficeIcon className="h-8 w-8 text-amber-500" />
                <span className="text-xl font-bold">Remodely CRM</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">Features</a>
                <a href="#pricing" className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">Pricing</a>
                <a href="#testimonials" className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">Reviews</a>
                <Link href="/auth/login" className="btn btn-outline">Sign In</Link>
                <Link href="/auth/register" className="btn btn-amber">Get Started</Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[var(--text)] hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-[var(--border)] bg-[var(--bg-primary)]">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors">Features</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors">Pricing</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors">Reviews</a>
                <div className="pt-4 pb-3 border-t border-[var(--border)]">
                  <div className="flex items-center space-x-3">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center btn btn-outline">Sign In</Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center btn gradient-amber">Get Started</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Add padding top to account for fixed header */}
      <div className="pt-16">

      {/* Background elements */}
      <div className="pointer-events-none select-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-3xl" />

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <TypewriterText
                text="Turn Every Project Into "
                speed={50}
                delay={500}
              />
              <span className="gradient-amber">
                <TypewriterText
                  text="Profit"
                  speed={80}
                  delay={1800}
                />
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-[var(--text-dim)] mb-8 max-w-4xl mx-auto leading-relaxed">
              The complete business management platform designed specifically for construction contractors. Streamline estimates, manage projects, track costs, and grow your business with tools that actually understand construction.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-lg text-[var(--text-dim)] mb-8">
              <div className="flex items-center justify-center gap-2">
                <CheckIcon className="h-5 w-5 text-emerald-500" />
                <span>From estimate to invoice in minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckIcon className="h-5 w-5 text-emerald-500" />
                <span>Real profit tracking on every job</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckIcon className="h-5 w-5 text-emerald-500" />
                <span>Built for contractors, by contractors</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register" className="btn btn-amber shadow-soft shine text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/dashboard" className="btn btn-outline text-lg px-8 py-4">
              View Live Demo →
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 justify-center text-sm text-[var(--text-dim)] mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-amber-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-amber-500" />
              <span>14 Days Full Access</span>
            </div>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-amber-500" />
              <span>500+ Companies Trust Us</span>
            </div>
          </div>

          {/* Industry tags */}
          <div className="flex flex-wrap gap-3 justify-center">
            {['Kitchen Remodeling', 'Bathroom Renovation', 'Whole Home Remodels', 'Home Additions', 'Exterior Renovations', 'Custom Cabinetry'].map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-[var(--border)] bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-amber-600">{stat.value}</div>
                <div className="text-sm font-medium text-[var(--text-dim)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Pillars */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-amber">Run, Grow & Automate</span> Your Construction Business
            </h2>
            <p className="text-xl text-[var(--text-dim)] max-w-3xl mx-auto">
              Three core pillars that transform how construction companies operate and scale their businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {businessPillars.map((pillar, index) => {
              const getColorClasses = (color: string) => {
                const colorMap = {
                  blue: { bg: 'bg-blue-600/15', ring: 'ring-blue-500/30', text: 'text-blue-600' },
                  amber: { bg: 'bg-amber-600/15', ring: 'ring-amber-500/30', text: 'text-amber-600' },
                  emerald: { bg: 'bg-emerald-600/15', ring: 'ring-emerald-500/30', text: 'text-emerald-600' }
                };
                return colorMap[color as keyof typeof colorMap] || colorMap.amber;
              };
              const colors = getColorClasses(pillar.color);

              return (
              <div key={index} className="text-center p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${colors.bg} ring-1 ${colors.ring}`}>
                  <pillar.icon className={`h-8 w-8 ${colors.text}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{pillar.label}</h3>
                <ul className="space-y-2">
                  {pillar.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2 text-[var(--text-dim)]">
                      <CheckIcon className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-amber">Scale Your Business</span>
            </h2>
            <div className="text-xl text-[var(--text-dim)] max-w-3xl mx-auto">
              <p>From client management to AI-powered automation, we've built the complete solution for modern construction companies.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-amber-500/50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-4">
                  <feature.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {feature.title}
                </h3>
                <div className="text-[var(--text-dim)] text-sm mb-4 leading-relaxed">
                  <p>{feature.description}</p>
                </div>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by <span className="gradient-amber">Construction Leaders</span>
            </h2>
            <p className="text-xl text-[var(--text-dim)]">
              See what our customers say about transforming their businesses
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-[var(--surface-1)] rounded-2xl p-8 md:p-12 border border-[var(--border)] text-center">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-6 w-6 text-amber-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
              <div className="text-center">
                <div className="font-semibold text-lg">{testimonials[activeTestimonial].name}</div>
                <div className="text-[var(--text-dim)]">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>

            {/* Testimonial dots */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-amber-600' : 'bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-amber">Simple, Transparent</span> Pricing
            </h2>
            <p className="text-xl text-[var(--text-dim)] mb-8">
              Start free and upgrade only when your operation demands more
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 p-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isYearly ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isYearly ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)]'
                }`}
              >
                Yearly <span className="text-emerald-600 text-xs ml-1">(Save 20%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative p-8 rounded-2xl border transition-all hover:shadow-lg ${
                plan.popular
                  ? 'bg-amber-600/5 border-amber-500/50 ring-2 ring-amber-500/20'
                  : 'bg-[var(--bg)] border-[var(--border)]'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-[var(--text-dim)] mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-[var(--text-dim)]">/month</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-emerald-600">
                      Save ${((plan.price.monthly - plan.price.yearly) * 12)} annually
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--text-dim)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'border border-[var(--border)] hover:border-amber-500/50 hover:text-amber-600'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-4 text-sm text-[var(--text-dim)]">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 text-amber-500" />
                <span>Usage-based AI pricing</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-amber-500" />
                <span>No setup fees</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-amber-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-amber-600/10 to-amber-500/5 rounded-3xl p-12 border border-amber-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your <span className="gradient-amber">Construction Business?</span>
            </h2>
            <div className="text-xl text-[var(--text-dim)] mb-8 max-w-2xl mx-auto">
              <p>Join hundreds of construction companies that have streamlined their operations and increased profits with Remodely CRM.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/register" className="btn btn-amber text-lg px-8 py-4 shadow-soft shine">
                Start Your Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/demo" className="btn btn-outline text-lg px-8 py-4 hover:border-amber-500/60 hover:text-amber-300 transition">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[var(--text-dim)]">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-amber-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-amber-500" />
                <span>Setup in under 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 text-amber-500" />
                <span>Free onboarding support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div> {/* Close the pt-16 container */}
    </div>
  );
}
