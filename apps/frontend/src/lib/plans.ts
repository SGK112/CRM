// CRM Plan Definitions and Capabilities

export type PlanTier = 'basic' | 'ai-pro' | 'enterprise';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  upgrade?: boolean;
}

export interface PlanCapabilities {
  // Core Features
  'clients.manage': boolean;
  'projects.manage': boolean;
  'calendar.basic': boolean;
  'estimates.basic': boolean;
  'invoices.basic': boolean;
  'documents.upload': boolean;
  'communications.basic': boolean;

  // AI-Enhanced Features
  'ai.descriptions': boolean;
  'ai.pricing': boolean;
  'ai.estimates': boolean;
  'ai.chat': boolean;
  'ai.analytics': boolean;
  'ai.voice': boolean;
  'ai.smart_search': boolean;
  'ai.auto_workflows': boolean;

  // Advanced Features
  'voice.agents': boolean;
  'voice.outbound': boolean;
  'voice.inbound': boolean;
  'voice.recordings': boolean;
  'design.studio': boolean;
  'design.templates': boolean;
  'design.cad': boolean;
  'analytics.advanced': boolean;
  'integrations.api': boolean;
  'integrations.zapier': boolean;
  'support.priority': boolean;
  'branding.custom': boolean;

  // Limits
  'limits.clients': number;
  'limits.projects': number;
  'limits.storage_gb': number;
  'limits.ai_requests': number;
  'limits.voice_minutes': number;
}

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  popular?: boolean;
  capabilities: PlanCapabilities;
  features: PlanFeature[];
}

// Plan Definitions
export const PLANS: Record<PlanTier, Plan> = {
  basic: {
    id: 'basic',
    name: 'Basic CRM',
    price: 0,
    period: 'month',
    description: 'Essential tools for small contractors',
    capabilities: {
      // Core Features - All included
      'clients.manage': true,
      'projects.manage': true,
      'calendar.basic': true,
      'estimates.basic': true,
      'invoices.basic': true,
      'documents.upload': true,
      'communications.basic': true,

      // AI Features - None included
      'ai.descriptions': false,
      'ai.pricing': false,
      'ai.estimates': false,
      'ai.chat': false,
      'ai.analytics': false,
      'ai.voice': false,
      'ai.smart_search': false,
      'ai.auto_workflows': false,

      // Advanced Features - Limited
      'voice.agents': false,
      'voice.outbound': false,
      'voice.inbound': false,
      'voice.recordings': false,
      'design.studio': false,
      'design.templates': false,
      'design.cad': false,
      'analytics.advanced': false,
      'integrations.api': false,
      'integrations.zapier': false,
      'support.priority': false,
      'branding.custom': false,

      // Limits
      'limits.clients': 50,
      'limits.projects': 25,
      'limits.storage_gb': 1,
      'limits.ai_requests': 0,
      'limits.voice_minutes': 0,
    },
    features: [
      {
        id: 'clients',
        name: 'Client Management',
        description: 'Up to 50 clients',
        included: true,
        limit: 50,
      },
      {
        id: 'projects',
        name: 'Project Tracking',
        description: 'Up to 25 projects',
        included: true,
        limit: 25,
      },
      {
        id: 'calendar',
        name: 'Basic Calendar',
        description: 'Appointment scheduling',
        included: true,
      },
      {
        id: 'estimates',
        name: 'Basic Estimates',
        description: 'Create and send estimates',
        included: true,
      },
      {
        id: 'invoices',
        name: 'Basic Invoicing',
        description: 'Create and send invoices',
        included: true,
      },
      {
        id: 'documents',
        name: 'Document Storage',
        description: '1GB storage',
        included: true,
        limit: 1,
      },
      { id: 'support', name: 'Community Support', description: 'Community forums', included: true },
      {
        id: 'ai',
        name: 'AI Features',
        description: 'Smart automation and insights',
        included: false,
        upgrade: true,
      },
      {
        id: 'voice',
        name: 'Voice Agents',
        description: 'AI-powered voice assistants',
        included: false,
        upgrade: true,
      },
      {
        id: 'design',
        name: 'Design Studio',
        description: 'Professional design tools',
        included: false,
        upgrade: true,
      },
    ],
  },

  'ai-pro': {
    id: 'ai-pro',
    name: 'AI Professional',
    price: 49,
    period: 'month',
    description: 'AI-powered tools for growing businesses',
    popular: true,
    capabilities: {
      // Core Features - All included
      'clients.manage': true,
      'projects.manage': true,
      'calendar.basic': true,
      'estimates.basic': true,
      'invoices.basic': true,
      'documents.upload': true,
      'communications.basic': true,

      // AI Features - All included
      'ai.descriptions': true,
      'ai.pricing': true,
      'ai.estimates': true,
      'ai.chat': true,
      'ai.analytics': true,
      'ai.voice': true,
      'ai.smart_search': true,
      'ai.auto_workflows': true,

      // Advanced Features - Most included
      'voice.agents': true,
      'voice.outbound': true,
      'voice.inbound': true,
      'voice.recordings': true,
      'design.studio': true,
      'design.templates': true,
      'design.cad': false,
      'analytics.advanced': true,
      'integrations.api': true,
      'integrations.zapier': true,
      'support.priority': true,
      'branding.custom': false,

      // Limits
      'limits.clients': 500,
      'limits.projects': 200,
      'limits.storage_gb': 25,
      'limits.ai_requests': 5000,
      'limits.voice_minutes': 500,
    },
    features: [
      {
        id: 'clients',
        name: 'Client Management',
        description: 'Up to 500 clients',
        included: true,
        limit: 500,
      },
      {
        id: 'projects',
        name: 'Project Tracking',
        description: 'Up to 200 projects',
        included: true,
        limit: 200,
      },
      {
        id: 'calendar',
        name: 'Smart Calendar',
        description: 'AI-powered scheduling',
        included: true,
      },
      {
        id: 'estimates',
        name: 'AI Estimates',
        description: 'Smart pricing suggestions',
        included: true,
      },
      {
        id: 'invoices',
        name: 'Smart Invoicing',
        description: 'Automated invoice generation',
        included: true,
      },
      {
        id: 'documents',
        name: 'Document Storage',
        description: '25GB storage',
        included: true,
        limit: 25,
      },
      {
        id: 'ai',
        name: 'Full AI Suite',
        description: '5,000 AI requests/month',
        included: true,
        limit: 5000,
      },
      {
        id: 'voice',
        name: 'Voice Agents',
        description: '500 minutes/month',
        included: true,
        limit: 500,
      },
      {
        id: 'design',
        name: 'Design Studio',
        description: 'Professional design tools',
        included: true,
      },
      {
        id: 'analytics',
        name: 'Advanced Analytics',
        description: 'AI-powered insights',
        included: true,
      },
      {
        id: 'integrations',
        name: 'API Access',
        description: 'Zapier & custom integrations',
        included: true,
      },
      {
        id: 'support',
        name: 'Priority Support',
        description: 'Email & chat support',
        included: true,
      },
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    period: 'month',
    description: 'Complete solution for large operations',
    capabilities: {
      // All features included
      'clients.manage': true,
      'projects.manage': true,
      'calendar.basic': true,
      'estimates.basic': true,
      'invoices.basic': true,
      'documents.upload': true,
      'communications.basic': true,
      'ai.descriptions': true,
      'ai.pricing': true,
      'ai.estimates': true,
      'ai.chat': true,
      'ai.analytics': true,
      'ai.voice': true,
      'ai.smart_search': true,
      'ai.auto_workflows': true,
      'voice.agents': true,
      'voice.outbound': true,
      'voice.inbound': true,
      'voice.recordings': true,
      'design.studio': true,
      'design.templates': true,
      'design.cad': true,
      'analytics.advanced': true,
      'integrations.api': true,
      'integrations.zapier': true,
      'support.priority': true,
      'branding.custom': true,

      // Unlimited limits
      'limits.clients': -1, // Unlimited
      'limits.projects': -1, // Unlimited
      'limits.storage_gb': 500,
      'limits.ai_requests': -1, // Unlimited
      'limits.voice_minutes': 2000,
    },
    features: [
      {
        id: 'unlimited',
        name: 'Unlimited Everything',
        description: 'No limits on clients or projects',
        included: true,
      },
      { id: 'ai', name: 'Unlimited AI', description: 'Unlimited AI requests', included: true },
      {
        id: 'voice',
        name: 'Enterprise Voice',
        description: '2,000 minutes/month',
        included: true,
        limit: 2000,
      },
      {
        id: 'design',
        name: 'Complete Design Suite',
        description: 'Including CAD integration',
        included: true,
      },
      {
        id: 'storage',
        name: 'Enterprise Storage',
        description: '500GB storage',
        included: true,
        limit: 500,
      },
      {
        id: 'branding',
        name: 'Custom Branding',
        description: 'White-label options',
        included: true,
      },
      {
        id: 'support',
        name: 'Dedicated Support',
        description: 'Phone, email, and dedicated rep',
        included: true,
      },
      { id: 'sla', name: 'SLA Guarantee', description: '99.9% uptime guarantee', included: true },
    ],
  },
};

// Utility functions
export function hasCapability(capability: keyof PlanCapabilities, userPlan: PlanTier): boolean {
  return PLANS[userPlan].capabilities[capability] as boolean;
}

export function getCapabilityLimit(capability: keyof PlanCapabilities, userPlan: PlanTier): number {
  return PLANS[userPlan].capabilities[capability] as number;
}

export function getUserPlan(): PlanTier {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user-plan');
    if (saved && (saved === 'basic' || saved === 'ai-pro' || saved === 'enterprise')) {
      return saved as PlanTier;
    }
  }
  return 'basic'; // Default to basic plan
}

export function setUserPlan(plan: PlanTier): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user-plan', plan);

    // Dispatch event to notify components
    window.dispatchEvent(
      new CustomEvent('plan-changed', {
        detail: { plan },
      })
    );
  }
}

export function getPlanColor(plan: PlanTier): string {
  switch (plan) {
    case 'basic':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case 'ai-pro':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'enterprise':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getUpgradeUrl(currentPlan: PlanTier, targetPlan?: PlanTier): string {
  const target = targetPlan || (currentPlan === 'basic' ? 'ai-pro' : 'enterprise');
  return `/dashboard/settings/billing?upgrade=${target}`;
}
