"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  system: Theme; // current system preference
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface Props { children: ReactNode }

const THEME_KEY = 'crm.theme';

export function ThemeProvider({ children }: Props) {
  // Default to dark to match marketing preference when no stored choice exists
  const [theme, setThemeState] = useState<Theme>('dark');
  const [system, setSystem] = useState<Theme>('light');

  const applyThemeClass = useCallback((t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystem = () => setSystem(mq.matches ? 'dark' : 'light');
    updateSystem();
    mq.addEventListener('change', updateSystem);
    return () => mq.removeEventListener('change', updateSystem);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    // Prefer stored choice; otherwise, default to dark for landing/marketing pages
    let initial: Theme = stored || 'dark';
    setThemeState(initial);
    applyThemeClass(initial);
  }, [applyThemeClass]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') localStorage.setItem(THEME_KEY, t);
    applyThemeClass(t);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, system }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
