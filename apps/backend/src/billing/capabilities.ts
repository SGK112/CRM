// Central capability matrix for plan-based feature gating
// Capabilities are simple string slugs grouped logically.
// Plans inherit capabilities of lower tiers implicitly (union logic below).

export type PlanCode = 'free' | 'starter' | 'growth';

export const planCapabilities: Record<PlanCode, string[]> = {
  free: [
    'vendors.read',
    'pricing.read',
    'estimates.create',
  ],
  starter: [
    'vendors.read', 'vendors.manage',
    'pricing.read', 'pricing.manage',
    'estimates.create', 'estimates.manage', 'estimates.send',
    'invoices.create', 'invoices.manage',
  ],
  growth: [
    'vendors.read', 'vendors.manage',
    'pricing.read', 'pricing.manage',
    'estimates.create', 'estimates.manage', 'estimates.send',
    'invoices.create', 'invoices.manage', 'invoices.send',
    'ai.voice', 'design.lab', 'integrations.google.calendar', 'integrations.google.vision'
  ],
};

// If a plan isn't explicitly defined, treat as free.
export function capabilitiesForPlan(plan?: string): Set<string> {
  const p = (plan || 'free') as PlanCode;
  const base = planCapabilities.free;
  if (p === 'starter') return new Set([...base, ...planCapabilities.starter]);
  if (p === 'growth') return new Set([...base, ...planCapabilities.starter, ...planCapabilities.growth]);
  return new Set(base);
}
