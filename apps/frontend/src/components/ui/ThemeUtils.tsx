/**
 * Theme-aware utility components for consistent light/dark theme support
 * These components replace hardcoded Tailwind classes with CSS variable-based styles
 */
'use client';

import React from 'react';

/**
 * ThemeIcon - Icon wrapper with proper theme-aware colors
 */
interface ThemeIconProps {
  children: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';
  className?: string;
}

export function ThemeIcon({ children, color = 'primary', className = '' }: ThemeIconProps) {
  const getIconColor = () => {
    switch (color) {
      case 'success':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'error':
        return 'var(--error)';
      case 'info':
        return 'var(--info)';
      case 'muted':
        return 'var(--text-muted)';
      case 'primary':
      default:
        return 'var(--accent)';
    }
  };

  return (
    <span className={className} style={{ color: getIconColor() }}>
      {children}
    </span>
  );
}

/**
 * ThemeTag - Tag/badge component with proper theme support
 */
interface ThemeTagProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function ThemeTag({ children, variant = 'default', className = '' }: ThemeTagProps) {
  const getTagStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--success)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: 'var(--warning)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          color: 'var(--info)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
        };
      default:
        return {
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        };
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      style={getTagStyles()}
    >
      {children}
    </span>
  );
}

/**
 * ThemeBorder - Border component with theme-aware styling
 */
interface ThemeBorderProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted';
}

export function ThemeBorder({ children, className = '', variant = 'default' }: ThemeBorderProps) {
  const getBorderColor = () => {
    switch (variant) {
      case 'muted':
        return 'var(--border-light)';
      default:
        return 'var(--border)';
    }
  };

  if (children) {
    return (
      <div
        className={`${className}`}
        style={{
          borderColor: getBorderColor(),
        }}
      >
        {children}
      </div>
    );
  }

  // Just return border styles for className usage
  return null;
}

/**
 * ThemeText - Text component with theme-aware colors
 */
interface ThemeTextProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'faint' | 'success' | 'warning' | 'error';
  className?: string;
  as?: 'span' | 'div' | 'p' | 'small';
}

export function ThemeText({
  children,
  variant = 'default',
  className = '',
  as = 'span',
}: ThemeTextProps) {
  const getTextColor = () => {
    switch (variant) {
      case 'muted':
        return 'var(--text-muted)';
      case 'faint':
        return 'var(--text-faint)';
      case 'success':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'error':
        return 'var(--error)';
      default:
        return 'var(--text)';
    }
  };

  const Component = as;

  return (
    <Component className={className} style={{ color: getTextColor() }}>
      {children}
    </Component>
  );
}

/**
 * ThemeBackground - Background component with theme-aware colors
 */
interface ThemeBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'surface1' | 'surface2' | 'surface3';
  className?: string;
}

export function ThemeBackground({
  children,
  variant = 'default',
  className = '',
}: ThemeBackgroundProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface1':
        return 'var(--surface-1)';
      case 'surface2':
        return 'var(--surface-2)';
      case 'surface3':
        return 'var(--surface-3)';
      default:
        return 'var(--bg)';
    }
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: getBackgroundColor(),
        color: 'var(--text)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Helper function to get theme-aware CSS classes
 */
export const themeClasses = {
  // Text colors
  text: {
    default: { color: 'var(--text)' },
    muted: { color: 'var(--text-muted)' },
    faint: { color: 'var(--text-faint)' },
    success: { color: 'var(--success)' },
    warning: { color: 'var(--warning)' },
    error: { color: 'var(--error)' },
    info: { color: 'var(--info)' },
  },

  // Background colors
  bg: {
    default: { backgroundColor: 'var(--bg)' },
    surface1: { backgroundColor: 'var(--surface-1)' },
    surface2: { backgroundColor: 'var(--surface-2)' },
    surface3: { backgroundColor: 'var(--surface-3)' },
  },

  // Border colors
  border: {
    default: { borderColor: 'var(--border)' },
    light: { borderColor: 'var(--border-light)' },
    focus: { borderColor: 'var(--border-focus)' },
  },
};

/**
 * Utility function to replace common Tailwind classes with theme-aware styles
 */
export function getThemeStyles(classes: string): React.CSSProperties {
  const styles: React.CSSProperties = {};

  // Handle common gray text classes
  if (classes.includes('text-gray-500') || classes.includes('text-gray-600')) {
    styles.color = 'var(--text-muted)';
  } else if (classes.includes('text-gray-400')) {
    styles.color = 'var(--text-faint)';
  } else if (classes.includes('text-gray-700') || classes.includes('text-gray-800')) {
    styles.color = 'var(--text)';
  }

  // Handle background classes
  if (classes.includes('bg-gray-100') || classes.includes('bg-gray-50')) {
    styles.backgroundColor = 'var(--surface-2)';
  } else if (classes.includes('bg-gray-200')) {
    styles.backgroundColor = 'var(--surface-3)';
  } else if (classes.includes('bg-gray-800') || classes.includes('bg-gray-900')) {
    styles.backgroundColor = 'var(--surface-1)';
  }

  // Handle border classes
  if (classes.includes('border-gray-200') || classes.includes('border-gray-300')) {
    styles.borderColor = 'var(--border)';
  } else if (classes.includes('border-gray-700') || classes.includes('border-gray-600')) {
    styles.borderColor = 'var(--border)';
  }

  return styles;
}
