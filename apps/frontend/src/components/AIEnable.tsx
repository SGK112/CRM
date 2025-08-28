'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Crown, Check } from 'lucide-react';

interface AIEnableProps {
  className?: string;
}

export default function AIEnable({ className = '' }: AIEnableProps) {
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasProPlan, setHasProPlan] = useState(false);

  // Check AI status and user plan on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check global AI setting
      const aiEnabled = localStorage.getItem('global-ai-enabled');
      setIsAIEnabled(aiEnabled === 'true');
      
      // Check if user has pro plan (you can replace this with actual API call)
      const userPlan = localStorage.getItem('user-plan') || 'pro'; // Default to 'pro' for testing
      setHasProPlan(userPlan === 'pro' || userPlan === 'enterprise');
    }
  }, []);

  const handleAIToggle = () => {
    if (!hasProPlan && !isAIEnabled) {
      // Show upgrade modal if user doesn't have pro plan
      setShowUpgradeModal(true);
      return;
    }
    
    const newState = !isAIEnabled;
    setIsAIEnabled(newState);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('global-ai-enabled', newState.toString());
      
      // Dispatch custom event to notify all components
      window.dispatchEvent(new CustomEvent('ai-enabled-changed', { 
        detail: { enabled: newState } 
      }));
      
      // Also dispatch to the AI context
      const aiEvent = new CustomEvent('ai-state-change', { 
        detail: { isEnabled: newState }
      });
      window.dispatchEvent(aiEvent);
    }
  };

  const handleUpgrade = () => {
    // In a real app, this would redirect to billing/upgrade page
    window.open('/dashboard/settings/billing?upgrade=pro', '_blank');
    setShowUpgradeModal(false);
  };

  return (
    <>
      <div className={`flex items-center ${className}`}>
        <button
          onClick={handleAIToggle}
          className={`
            relative inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 
            text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-offset-1
            ${isAIEnabled 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg hover:shadow-xl hover:scale-105 focus:ring-blue-500' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-gray-500'
            }
          `}
          title={isAIEnabled ? 'AI features are enabled' : hasProPlan ? 'Enable AI features' : 'Upgrade to enable AI features'}
        >
          <Sparkles className={`h-4 w-4 ${isAIEnabled ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
          
          <span className="hidden sm:inline">
            {isAIEnabled ? 'AI Enabled' : 'Enable AI'}
          </span>
          
          {isAIEnabled && (
            <div className="flex items-center gap-1">
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                PRO
              </span>
            </div>
          )}
          
          {!hasProPlan && !isAIEnabled && (
            <Crown className="h-3 w-3 text-amber-500" />
          )}
        </button>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowUpgradeModal(false)}
            />
            
            {/* Modal */}
            <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 px-6 py-8 shadow-2xl transition-all sm:w-full sm:max-w-lg">
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Unlock AI-Powered Features
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upgrade to Pro to access AI-enhanced descriptions, smart pricing suggestions, 
                  and automated workflows that save you hours of work.
                </p>
                
                {/* Features */}
                <div className="text-left mb-6 space-y-3">
                  {[
                    'AI-powered project descriptions',
                    'Smart pricing recommendations',
                    'Automated estimate generation',
                    'Intelligent client communication',
                    'Advanced analytics and insights'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleUpgrade}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
