'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'compact';
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ 
  variant = 'button', 
  showLabel = false, 
  className = '' 
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, system } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative p-2 rounded-lg surface-2 border border-token hover:surface-3 transition-all duration-200 group ${className}`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <SunIcon className="h-5 w-5 text-amber-500 group-hover:text-amber-600" />
        ) : (
          <MoonIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg surface-2 border border-token hover:surface-3 transition-all duration-200 text-sm font-medium text-primary"
        >
          {theme === 'light' ? (
            <SunIcon className="h-4 w-4 text-amber-500" />
          ) : (
            <MoonIcon className="h-4 w-4 text-blue-400" />
          )}
          {showLabel && <span className="capitalize">{theme}</span>}
          <svg className="w-4 h-4 ml-1 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-44 surface-1 elevated border border-token rounded-lg shadow-lg py-1 z-20">
              <div className="px-3 py-2 text-xs uppercase tracking-wide text-tertiary border-b border-token">
                Theme
              </div>
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:surface-2 transition-colors ${
                    theme === t ? 'text-amber-600 font-medium' : 'text-primary'
                  }`}
                >
                  {t === 'light' ? (
                    <SunIcon className="h-4 w-4" />
                  ) : (
                    <MoonIcon className="h-4 w-4" />
                  )}
                  <span className="capitalize">{t}</span>
                  {theme === t && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-amber-600"></div>
                  )}
                </button>
              ))}
              <div className="px-3 py-2 text-xs text-tertiary border-t border-token mt-1">
                <div className="flex items-center gap-2">
                  <ComputerDesktopIcon className="h-3 w-3" />
                  <span>System: {system}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg surface-2 border border-token hover:surface-3 transition-all duration-200 text-sm font-medium text-primary group ${className}`}
    >
      {theme === 'light' ? (
        <SunIcon className="h-5 w-5 text-amber-500 group-hover:text-amber-600" />
      ) : (
        <MoonIcon className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
      )}
      {showLabel && (
        <span>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </button>
  );
}
