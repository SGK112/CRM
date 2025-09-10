'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ColorTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

interface ColorContextType {
  currentTheme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  saveTheme: (theme: ColorTheme) => Promise<void>;
  applyTheme: (theme: ColorTheme) => void;
  isLoading: boolean;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

const defaultTheme: ColorTheme = {
  name: 'Remodely Orange (Default)',
  colors: {
    primary: '#d97706',
    secondary: '#f59e0b',
    accent: '#fb923c',
    background: '#0f172a', // Dark background
    surface: '#1e293b',    // Dark surface
    text: '#f1f5f9',       // Light text
    textSecondary: '#94a3b8', // Muted text
    border: '#334155',     // Dark border
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedTheme = useCallback(async () => {
    try {
      // Try to load from API first
      const response = await fetch('/api/user/theme', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success !== false && data.theme) {
          const theme = JSON.parse(data.theme);
          setCurrentTheme(theme);
          applyTheme(theme);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to localStorage
      const savedTheme = localStorage.getItem('customColorTheme');
      if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        setCurrentTheme(theme);
        applyTheme(theme);
      } else {
        // Apply default theme
        applyTheme(defaultTheme);
      }
    } catch (error) {
      // Failed to load theme, use default
      applyTheme(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, [loadSavedTheme]);

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement;
    
    // Map theme colors to CSS variables
    const cssVariables = {
      '--brand': theme.colors.primary,
      '--brand-hover': theme.colors.secondary,
      '--brand-light': theme.colors.accent,
      '--bg': theme.colors.background,
      '--surface': theme.colors.surface,
      '--surface-2': theme.colors.surface,
      '--text': theme.colors.text,
      '--text-muted': theme.colors.textSecondary,
      '--text-dim': theme.colors.textSecondary,
      '--border': theme.colors.border,
      '--token': theme.colors.border,
      '--success': theme.colors.success,
      '--warning': theme.colors.warning,
      '--error': theme.colors.error,
      '--accent': theme.colors.accent,
    };

    // Apply all CSS variables
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update Tailwind brand colors
    root.style.setProperty('--color-brand-50', `${theme.colors.primary}0d`);
    root.style.setProperty('--color-brand-100', `${theme.colors.primary}1a`);
    root.style.setProperty('--color-brand-200', `${theme.colors.primary}33`);
    root.style.setProperty('--color-brand-300', `${theme.colors.primary}4d`);
    root.style.setProperty('--color-brand-400', `${theme.colors.primary}66`);
    root.style.setProperty('--color-brand-500', theme.colors.primary);
    root.style.setProperty('--color-brand-600', theme.colors.primary);
    root.style.setProperty('--color-brand-700', theme.colors.secondary);
    root.style.setProperty('--color-brand-800', `${theme.colors.primary}cc`);
    root.style.setProperty('--color-brand-900', `${theme.colors.primary}e6`);
  };

  const setTheme = (theme: ColorTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    // Save to localStorage immediately for persistence
    localStorage.setItem('customColorTheme', JSON.stringify(theme));
  };

  const saveTheme = async (theme: ColorTheme) => {
    try {
      // Save to API
      const response = await fetch('/api/user/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: JSON.stringify(theme),
          name: theme.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme to server');
      }

      // Always save to localStorage as backup
      localStorage.setItem('customColorTheme', JSON.stringify(theme));
      
      // Apply the theme
      setCurrentTheme(theme);
      applyTheme(theme);
    } catch (error) {
      // Still save locally even if API fails
      localStorage.setItem('customColorTheme', JSON.stringify(theme));
      setCurrentTheme(theme);
      applyTheme(theme);
      throw error;
    }
  };

  return (
    <ColorContext.Provider
      value={{
        currentTheme,
        setTheme,
        saveTheme,
        applyTheme,
        isLoading,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}

export type { ColorTheme };
