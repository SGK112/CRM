'use client';

import React from 'react';
import { FileText, Calculator, Receipt } from 'lucide-react';

interface EstimateInvoiceToggleProps {
  currentMode: 'estimate' | 'invoice';
  onModeChange: (mode: 'estimate' | 'invoice') => void;
  disabled?: boolean;
  className?: string;
}

export default function EstimateInvoiceToggle({ 
  currentMode, 
  onModeChange, 
  disabled = false,
  className = ''
}: EstimateInvoiceToggleProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-1 ${className}`}>
      <button
        onClick={() => onModeChange('estimate')}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentMode === 'estimate'
            ? 'bg-white dark:bg-gray-700 text-brand-700 dark:text-brand-400 shadow-sm border border-gray-200 dark:border-gray-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Calculator className="w-4 h-4" />
        Estimate
      </button>
      <button
        onClick={() => onModeChange('invoice')}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentMode === 'invoice'
            ? 'bg-white dark:bg-gray-700 text-brand-700 dark:text-brand-400 shadow-sm border border-gray-200 dark:border-gray-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Receipt className="w-4 h-4" />
        Invoice
      </button>
    </div>
  );
}
