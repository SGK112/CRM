// Lightweight front-end capability map to align UI gating with plans
// Note: Backend is source of truth; this mirrors likely gating for UX hints.

export type PlanSlug = 'free' | 'starter' | 'professional' | 'enterprise' | 'growth';

const PLAN_ALIASES: Record<string, PlanSlug> = {
  free: 'free',
  trial: 'starter', // treat trial as starter for UI until confirmed
  starter: 'starter',
  basic: 'starter',
  pro: 'professional',
  professional: 'professional',
  enterprise: 'enterprise',
  growth: 'growth'
};

const CAPABILITIES: Record<PlanSlug, string[]> = {
  free: [
    'core.crm',
    'projects.basic',
    'estimates.create'
  ],
  starter: [
    'core.crm', 'projects.basic', 'estimates.create', 'invoices.basic',
  ],
  professional: [
    'core.crm', 'projects.basic', 'estimates.create', 'invoices.basic', 'reports.advanced', 'api.access',
    'ai.voice', 'design.lab'
  ],
  enterprise: [
    'core.crm', 'projects.basic', 'estimates.create', 'invoices.basic', 'reports.advanced', 'api.access',
    'ai.voice', 'design.lab', 'sso.saml', 'support.247'
  ],
  growth: [
    'core.crm', 'projects.basic', 'estimates.create', 'invoices.basic', 'reports.advanced', 'api.access',
    'ai.voice', 'design.lab'
  ]
};

export function normalizePlan(plan?: string | null): PlanSlug {
  if (!plan) return 'free';
  const key = String(plan).toLowerCase().trim();
  return PLAN_ALIASES[key] || 'free';
}

export function capabilitiesForPlan(plan?: string | null): Set<string> {
  const slug = normalizePlan(plan);
  const caps = new Set<string>();
  if (slug === 'enterprise') {
    ['starter','professional','enterprise'].forEach(p => CAPABILITIES[p as PlanSlug].forEach(c => caps.add(c)));
    return caps;
  }
  if (slug === 'professional') {
    ['starter','professional'].forEach(p => CAPABILITIES[p as PlanSlug].forEach(c => caps.add(c)));
    return caps;
  }
  if (slug === 'growth') {
    ['starter','growth'].forEach(p => CAPABILITIES[p as PlanSlug].forEach(c => caps.add(c)));
    return caps;
  }
  CAPABILITIES[slug].forEach(c => caps.add(c));
  return caps;
}

export function hasAllCapabilities(required: string[] | string, plan?: string | null): boolean {
  const caps = capabilitiesForPlan(plan);
  const needed = Array.isArray(required) ? required : [required];
  return needed.every(n => caps.has(n));
}
