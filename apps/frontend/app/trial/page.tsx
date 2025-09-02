'use client';

import dynamic from 'next/dynamic';

// Dynamic chunks (client-side only heavy sections)
const HeroSection = dynamic(() => import('./components/HeroSection').then(m => m.HeroSection), {
  ssr: true,
});
const SocialProof = dynamic(() => import('./components/SocialProof').then(m => m.SocialProof), {
  ssr: true,
});
const Loading = () => <div className="py-24 text-center text-slate-500 text-sm">Loading...</div>;
const TestimonialsSection = dynamic(
  () => import('./components/TestimonialsSection').then(m => m.TestimonialsSection),
  { ssr: false, loading: Loading }
);
const FeatureShowcase = dynamic(
  () => import('./components/FeatureShowcase').then(m => m.FeatureShowcase),
  { ssr: true, loading: Loading }
);
const ComparisonTable = dynamic(
  () => import('./components/ComparisonTable').then(m => m.ComparisonTable),
  { ssr: true, loading: Loading }
);
const DemoVideo = dynamic(() => import('./components/DemoVideo').then(m => m.DemoVideo), {
  ssr: false,
  loading: Loading,
});
const Integrations = dynamic(() => import('./components/Integrations').then(m => m.Integrations), {
  ssr: false,
  loading: Loading,
});
const IncludedFeatures = dynamic(
  () => import('./components/IncludedFeatures').then(m => m.IncludedFeatures),
  { ssr: false, loading: Loading }
);
const PricingSection = dynamic(
  () => import('./components/PricingSection').then(m => m.PricingSection),
  { ssr: true, loading: Loading }
);
const FAQ = dynamic(() => import('./components/FAQ').then(m => m.FAQ), {
  ssr: true,
  loading: Loading,
});
const RiskReversal = dynamic(() => import('./components/RiskReversal').then(m => m.RiskReversal), {
  ssr: false,
  loading: Loading,
});
const FinalCTA = dynamic(() => import('./components/FinalCTA').then(m => m.FinalCTA), {
  ssr: true,
  loading: Loading,
});
const FloatingCTA = dynamic(() => import('./components/FloatingCTA').then(m => m.FloatingCTA), {
  ssr: false,
});
const Navigation = dynamic(() => import('./components/Navigation').then(m => m.Navigation), {
  ssr: true,
});

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
  );
}
