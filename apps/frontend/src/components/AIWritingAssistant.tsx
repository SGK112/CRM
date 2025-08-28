'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';

interface AISuggestion {
  text: string;
  confidence: number;
  type: 'completion' | 'enhancement' | 'alternative';
}

interface AIWritingAssistantProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  itemName?: string;
  category?: string;
  className?: string;
  disabled?: boolean;
}

export default function AIWritingAssistant({
  value,
  onChange,
  placeholder = "Enter description...",
  itemName = "",
  category = "",
  className = "",
  disabled = false
}: AIWritingAssistantProps) {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // More conservative AI suggestions - only trigger when really helpful
  const generateSuggestion = (text: string, name: string, cat: string): string => {
    const lowerText = text.toLowerCase().trim();
    const lowerName = name.toLowerCase();
    const lowerCat = cat.toLowerCase();

    // Don't suggest if text is already substantial or complete
    if (lowerText.length > 50 || lowerText.endsWith('.') || lowerText.endsWith('!')) {
      return '';
    }

    // Only suggest for empty fields with clear context
    if (lowerText.length === 0 && lowerName.length > 2) {
      // Simple category-based suggestions
      const categoryTemplates = {
        labor: "Professional installation with skilled craftsmanship and quality workmanship",
        materials: "High-quality materials with manufacturer warranty and professional installation",
        permits: "Required permits and inspections for code compliance",
        equipment: "Professional-grade equipment rental for efficient installation",
        overhead: "Project management and administrative costs",
        other: "Additional services and materials for project completion"
      };

      // Simple name-based suggestions
      const nameKeywords = {
        cabinet: "Custom cabinet installation with precision hardware and finishing",
        countertop: "Professional countertop fabrication and installation",
        flooring: "Expert flooring installation with proper preparation",
        tile: "Precision tile installation with professional finishing",
        plumbing: "Licensed plumbing work with code-compliant installation",
        electrical: "Licensed electrical work meeting current safety codes",
        paint: "Professional painting with surface preparation and quality finish",
        drywall: "Expert drywall installation with smooth finishing"
      };

      // Try name-based suggestions first
      for (const [keyword, template] of Object.entries(nameKeywords)) {
        if (lowerName.includes(keyword)) {
          return template;
        }
      }
      
      // Fall back to category-based suggestions
      if (lowerCat && categoryTemplates[lowerCat as keyof typeof categoryTemplates]) {
        return categoryTemplates[lowerCat as keyof typeof categoryTemplates];
      }
    }

    // Only complete if user has started typing something meaningful
    if (lowerText.length >= 3 && lowerText.length <= 20) {
      const simpleCompletions = [
        " with professional installation and warranty",
        " including all materials and labor",
        " with expert craftsmanship and quality finishing"
      ];

      for (const completion of simpleCompletions) {
        if (!lowerText.includes(completion.toLowerCase()) && 
            lowerText.length + completion.length < 80) {
          return text + completion;
        }
      }
    }

    return '';
  };

  const fetchSuggestion = async (text: string) => {
    setIsLoading(true);
    
    // Very quick AI processing for discreet UX
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newSuggestion = generateSuggestion(text, itemName, category);
    
    // Clear suggestion if it's no longer relevant to current text
    if (newSuggestion && text.length > 0 && !newSuggestion.toLowerCase().startsWith(text.toLowerCase())) {
      setSuggestion('');
      setShowSuggestion(false);
    } else {
      setSuggestion(newSuggestion);
      setShowSuggestion(newSuggestion.length > 0 && newSuggestion !== text);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!disabled) {
        fetchSuggestion(value);
      } else {
        setSuggestion('');
        setShowSuggestion(false);
      }
    }, 300); // Slightly longer delay for more discreet behavior

    return () => clearTimeout(timer);
  }, [value, itemName, category, disabled]);

  const acceptSuggestion = () => {
    if (suggestion && showSuggestion) {
      onChange(suggestion);
      setSuggestion('');
      setShowSuggestion(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && showSuggestion && suggestion) {
      e.preventDefault();
      acceptSuggestion();
    } else if (e.key === 'Escape') {
      setSuggestion('');
      setShowSuggestion(false);
    }
  };

  // Enhanced logic to clear stuck suggestions
  const getGhostText = () => {
    if (!suggestion || suggestion === value) {
      return '';
    }
    
    // Clear suggestion if user has typed past it or it no longer matches
    if (value.length > 0 && !suggestion.toLowerCase().startsWith(value.toLowerCase())) {
      setSuggestion('');
      setShowSuggestion(false);
      return '';
    }
    
    // If suggestion starts with the current value, show the remainder
    if (suggestion.toLowerCase().startsWith(value.toLowerCase())) {
      return suggestion.slice(value.length);
    }
    
    return '';
  };

  const ghostText = getGhostText();

  return (
    <div className="relative">
      <div className="relative">
        {/* Hidden div to measure text dimensions */}
        <div 
          ref={ghostRef}
          className="absolute opacity-0 pointer-events-none whitespace-pre-wrap break-words"
          style={{
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            padding: '8px',
            border: '1px solid transparent',
            width: '100%'
          }}
          aria-hidden="true"
        >
          {value}
        </div>

        {/* Main textarea - remove prominent styling when AI is active */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-2 pr-20 pb-4 bg-[var(--input-bg)] border border-[var(--border)] rounded text-[var(--text)] text-sm transition-all duration-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent relative z-10 resize-y min-h-[60px] ${className}`}
          rows={2}
        />

        {/* Subtle ghost text overlay - very discreet */}
        {ghostText && (
          <div 
            className="absolute top-0 left-0 p-2 pr-20 pb-4 text-sm pointer-events-none whitespace-pre-wrap break-words z-5"
            style={{
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            }}
          >
            {/* Invisible text to position the suggestion correctly */}
            <span className="opacity-0">{value}</span>
            {/* Very subtle suggestion text */}
            <span className="text-brand-400 dark:text-brand-600 opacity-40">
              {suggestion.toLowerCase().startsWith(value.toLowerCase()) 
                ? suggestion.slice(value.length)
                : suggestion
              }
            </span>
          </div>
        )}
        
        {/* Very discreet AI Indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {isLoading ? (
            <div className="w-3 h-3 opacity-30">
              <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-brand-400"></div>
            </div>
          ) : ghostText ? (
            <div className="flex items-center gap-1 px-1 py-0.5 bg-gray-50 dark:bg-gray-800 rounded opacity-60 hover:opacity-100 transition-opacity">
              <Bot className="w-2.5 h-2.5 text-gray-400" />
              <span className="text-gray-500 font-normal text-xs">tab</span>
            </div>
          ) : (
            <Bot className="w-3 h-3 text-gray-300 opacity-30" />
          )}
        </div>

        {/* Discrete Resize Grip */}
        <div className="absolute bottom-2 right-2 pointer-events-none z-20 opacity-30 hover:opacity-60 transition-opacity">
          <div className="w-3 h-3 flex flex-col justify-end items-end gap-px">
            <div className="flex gap-px">
              <div className="w-1 h-px bg-gray-400"></div>
            </div>
            <div className="flex gap-px">
              <div className="w-1 h-px bg-gray-400"></div>
              <div className="w-1 h-px bg-gray-400"></div>
            </div>
            <div className="flex gap-px">
              <div className="w-1 h-px bg-gray-400"></div>
              <div className="w-1 h-px bg-gray-400"></div>
              <div className="w-1 h-px bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove the prominent hint panel - keep it very quiet */}
      {ghostText && (
        <div className="mt-1 text-xs text-gray-400 dark:text-gray-600 opacity-60">
          Press Tab to accept suggestion
        </div>
      )}
    </div>
  );
}
