'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamic chunks (client-side only heavy sections)
const HeroSection = dynamic(() => import('./components/HeroSection').then(m => m.HeroSection), { ssr: true })
const SocialProof = dynamic(() => import('./components/SocialProof').then(m => m.SocialProof), { ssr: true })
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection').then(m => m.TestimonialsSection), { ssr: false })
const FeatureShowcase = dynamic(() => import('./components/FeatureShowcase').then(m => m.FeatureShowcase), { ssr: false })
const ComparisonTable = dynamic(() => import('./components/ComparisonTable').then(m => m.ComparisonTable), { ssr: false })
const DemoVideo = dynamic(() => import('./components/DemoVideo').then(m => m.DemoVideo), { ssr: false })
const Integrations = dynamic(() => import('./components/Integrations').then(m => m.Integrations), { ssr: false })
const IncludedFeatures = dynamic(() => import('./components/IncludedFeatures').then(m => m.IncludedFeatures), { ssr: false })
const PricingSection = dynamic(() => import('./components/PricingSection').then(m => m.PricingSection), { ssr: false })
const FAQ = dynamic(() => import('./components/FAQ').then(m => m.FAQ), { ssr: false })
const RiskReversal = dynamic(() => import('./components/RiskReversal').then(m => m.RiskReversal), { ssr: false })
const FinalCTA = dynamic(() => import('./components/FinalCTA').then(m => m.FinalCTA), { ssr: false })
const FloatingCTA = dynamic(() => import('./components/FloatingCTA').then(m => m.FloatingCTA), { ssr: false })
const Navigation = dynamic(() => import('./components/Navigation').then(m => m.Navigation), { ssr: true })

// Data heavy arrays moved into lazily loaded components above

export default function FreeTrialPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navigation />
      <HeroSection />
      <SocialProof />
      <TestimonialsSection />
      <FeatureShowcase />
      <ComparisonTable />
      <DemoVideo />
      <Integrations />
      <IncludedFeatures />
      <PricingSection />
      <FAQ />
      <RiskReversal />
      <FinalCTA />
      <FloatingCTA />
    </div>
  )
}
