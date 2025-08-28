"use client";
import React, { useState, useEffect } from 'react';
import { Crown, Lock, ArrowUpRight, Check, Sparkles, Zap } from 'lucide-react';
import { 
  hasCapability, 
  getUserPlan, 
  getUpgradeUrl, 
  getPlanColor, 
  PLANS, 
  type PlanTier,
  type PlanCapabilities 
} from '@/lib/plans';

interface CapabilityGateProps {
  need: keyof PlanCapabilities | (keyof PlanCapabilities)[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
  upgradeMessage?: string;
}

export function CapabilityGate({ 
  need, 
  children, 
  fallback, 
  onUpgrade,
  showUpgradeButton = true,
  upgradeMessage
}: CapabilityGateProps) {
  const [userPlan, setUserPlan] = useState<PlanTier>('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserPlan(getUserPlan());
    setLoading(false);

    // Listen for plan changes
    const handlePlanChange = (event: CustomEvent) => {
      setUserPlan(event.detail.plan);
    };

    window.addEventListener('plan-changed', handlePlanChange as EventListener);
    return () => window.removeEventListener('plan-changed', handlePlanChange as EventListener);
  }, []);

  if (loading) {
    return <>{fallback || <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>}</>;
  }

  // Check if user has the required capability
  const capabilities = Array.isArray(need) ? need : [need];
  const hasAllCapabilities = capabilities.every(cap => hasCapability(cap, userPlan));

  if (hasAllCapabilities) {
    return <>{children}</>;
  }

  // Show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt 
      capabilities={capabilities}
      currentPlan={userPlan}
      onUpgrade={onUpgrade}
      showButton={showUpgradeButton}
      message={upgradeMessage}
    />
  );
}

interface UpgradePromptProps {
  capabilities: (keyof PlanCapabilities)[];
  currentPlan: PlanTier;
  onUpgrade?: () => void;
  showButton?: boolean;
  message?: string;
}

function UpgradePrompt({ 
  capabilities, 
  currentPlan, 
  onUpgrade,
  showButton = true,
  message 
}: UpgradePromptProps) {
  // Find the minimum plan that includes all required capabilities
  const requiredPlan = capabilities.some(cap => cap.includes('voice')) || capabilities.some(cap => cap.includes('ai'))
    ? 'ai-pro' 
    : 'ai-pro';

  const plan = PLANS[requiredPlan];
  const upgradeUrl = getUpgradeUrl(currentPlan, requiredPlan);

  const defaultMessage = capabilities.length === 1 
    ? `This feature requires ${plan.name}`
    : `These features require ${plan.name}`;

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
            {message || defaultMessage}
          </h3>
          
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
            Upgrade to unlock AI-powered features, voice agents, and advanced tools.
          </p>

          {/* Feature highlights for the required plan */}
          <div className="space-y-1 mb-3">
            {plan.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>{feature.name}</span>
              </div>
            ))}
          </div>

          {showButton && (
            <div className="flex items-center gap-2">
              <a
                href={upgradeUrl}
                onClick={onUpgrade}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                <Crown className="w-3 h-3" />
                Upgrade to {plan.name}
                <ArrowUpRight className="w-3 h-3" />
              </a>
              
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                ${plan.price}/{plan.period}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Legacy compatibility exports
export function UpgradeInline({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <UpgradePrompt 
      capabilities={['ai.descriptions']}
      currentPlan={getUserPlan()}
      onUpgrade={onUpgrade}
    />
  );
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  
  const currentPlan = getUserPlan();
  const targetPlan = currentPlan === 'basic' ? 'ai-pro' : 'enterprise';
  const plan = PLANS[targetPlan];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 px-6 py-8 shadow-2xl transition-all sm:w-full sm:max-w-lg">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unlock {plan.name} Features
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {plan.description}
            </p>
            
            {/* Features */}
            <div className="text-left mb-6 space-y-3">
              {plan.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature.name} - {feature.description}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Maybe Later
              </button>
              <a
                href={getUpgradeUrl(currentPlan, targetPlan)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 text-center"
              >
                Upgrade ${plan.price}/{plan.period}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plan badge component for showing current plan
export function PlanBadge({ plan, className = '' }: { plan?: PlanTier; className?: string }) {
  const userPlan = plan || getUserPlan();
  const planData = PLANS[userPlan];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(userPlan)} ${className}`}>
      {userPlan === 'basic' && <Lock className="w-3 h-3" />}
      {userPlan === 'ai-pro' && <Zap className="w-3 h-3" />}
      {userPlan === 'enterprise' && <Crown className="w-3 h-3" />}
      {planData.name}
    </span>
  );
}
