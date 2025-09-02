import React from 'react';

interface MarketingPageProps {
  children: React.ReactNode;
  className?: string;
}
export function MarketingPage({ children, className = '' }: MarketingPageProps) {
  return <div className={'min-h-screen bg-slate-950 text-slate-100 ' + className}>{children}</div>;
}

interface HeroProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  kicker?: string;
  center?: boolean;
}
export function MarketingHero({ icon, title, subtitle, kicker, center = true }: HeroProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
      <div className="max-w-4xl mx-auto">
        {icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-600/15 ring-1 ring-amber-500/30 mb-6">
            {icon}
          </div>
        )}
        {kicker && (
          <p className="text-[11px] uppercase tracking-wide text-amber-400 mb-3 font-medium">
            {kicker}
          </p>
        )}
        <h1
          className="heading-primary mb-4 gradient-amber"
          style={{ marginBottom: subtitle ? '1.25rem' : '0' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="heading-secondary text-slate-300 max-w-3xl mx-auto leading-relaxed text-base sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
