'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AIContextType {
  isAIEnabled: boolean;
  setAIEnabled: (enabled: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [isAIEnabled, setIsAIEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check global AI setting
      const aiEnabled = localStorage.getItem('global-ai-enabled');
      setIsAIEnabled(aiEnabled === 'true');

      // Listen for changes from the AI Enable component
      const handleAIChange = (event: CustomEvent) => {
        setIsAIEnabled(event.detail.enabled || event.detail.isEnabled);
      };

      window.addEventListener('ai-enabled-changed', handleAIChange as EventListener);
      window.addEventListener('ai-state-change', handleAIChange as EventListener);
      
      return () => {
        window.removeEventListener('ai-enabled-changed', handleAIChange as EventListener);
        window.removeEventListener('ai-state-change', handleAIChange as EventListener);
      };
    }
  }, []);

  const setAIEnabled = (enabled: boolean) => {
    setIsAIEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('global-ai-enabled', enabled.toString());
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('ai-enabled-changed', { 
        detail: { enabled } 
      }));
    }
  };

  return (
    <AIContext.Provider value={{ isAIEnabled, setAIEnabled }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
