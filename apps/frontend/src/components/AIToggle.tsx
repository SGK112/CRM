'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIToggleProps {
  isAIEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export default function AIToggle({ 
  isAIEnabled, 
  onToggle, 
  className = '',
  size = 'md',
  showLabels = false 
}: AIToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onToggle(!isAIEnabled)}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 ease-in-out
          ${isAIEnabled 
            ? 'bg-blue-500' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1
        `}
        aria-label={`Toggle AI features ${isAIEnabled ? 'off' : 'on'}`}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
            ${isAIEnabled ? 'translate-x-4' : 'translate-x-0.5'}
            shadow-sm
          `}
        />
      </button>
      
      {showLabels && (
        <div className="flex items-center gap-1.5">
          <Sparkles className={`h-3 w-3 ${isAIEnabled ? 'text-blue-500' : 'text-gray-400'} transition-colors duration-200`} />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            AI
          </span>
          {isAIEnabled && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium dark:bg-blue-900/30 dark:text-blue-300">
              PRO
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function AIToggleCompact({ isAIEnabled, onToggle, className = '' }: Omit<AIToggleProps, 'size' | 'showLabels'>) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onToggle(!isAIEnabled)}
        className={`
          relative inline-flex h-4 w-7 items-center rounded-full transition-all duration-200 ease-in-out
          ${isAIEnabled 
            ? 'bg-blue-500' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1
        `}
        aria-label={`Toggle AI features ${isAIEnabled ? 'off' : 'on'}`}
      >
        <span
          className={`
            inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out
            ${isAIEnabled ? 'translate-x-3' : 'translate-x-0.5'}
            shadow-sm
          `}
        />
      </button>
      
      <span className="text-xs text-gray-500 dark:text-gray-400">
        AI
      </span>
      
      {isAIEnabled && (
        <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-medium dark:bg-blue-900/30 dark:text-blue-300">
          PRO
        </span>
      )}
    </div>
  );
}