/**
 * Standardized Theme Utilities for Remodely CRM
 * Provides consistent CSS classes and utilities that match the dashboard design
 */

// Standard color classes that work with our CSS variables
export const standardColors = {
  // Background and surface colors
  bg: {
    primary: 'bg-[var(--bg)]',
    surface1: 'bg-[var(--surface-1)]',
    surface2: 'bg-[var(--surface-2)]',
    surface3: 'bg-[var(--surface-3)]',
  },

  // Text colors with proper contrast
  text: {
    primary: 'text-[var(--text)]',
    muted: 'text-[var(--text-muted)]',
    faint: 'text-[var(--text-faint)]',
  },

  // Border colors
  border: {
    default: 'border-[var(--border)]',
    light: 'border-[var(--border-light)]',
    focus: 'border-[var(--border-focus)]',
  },

  // Accent colors
  accent: {
    default: 'text-[var(--accent)]',
    bg: 'bg-[var(--accent)]',
    light: 'bg-[var(--accent-light)]',
    hover: 'hover:bg-[var(--accent-hover)]',
  },
};

// Standard component classes
export const standardComponents = {
  // Card styling that matches dashboard
  card: {
    base: 'bg-[var(--surface-1)] border border-[var(--border)] rounded-xl shadow-lg transition-all duration-300',
    hover: 'hover:shadow-xl hover:scale-105 hover:border-[var(--accent)]',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },

  // Button styling that matches dashboard
  button: {
    base: 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary:
      'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105 shadow-lg hover:shadow-xl',
    secondary:
      'bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:scale-105',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    },
  },

  // Input styling that matches dashboard
  input: {
    base: 'w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--text)] transition-all duration-200',
    focus:
      'focus:outline-none focus:border-[var(--input-border-focus)] focus:ring-2 focus:ring-orange-500/20',
    hover: 'hover:border-[var(--input-border-hover)]',
  },

  // Section headers that match dashboard
  header: {
    title: 'text-2xl font-bold text-[var(--text)] mb-2',
    subtitle: 'text-lg text-[var(--text-muted)] font-medium',
    wrapper:
      'mb-6 bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-lg',
  },

  // Status badges that match dashboard
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
    success: 'bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-[var(--surface-2)] dark:text-[var(--text)]',
  },

  // Table styling that matches dashboard
  table: {
    wrapper:
      'bg-[var(--surface-1)] rounded-lg border border-[var(--border)] overflow-hidden shadow-lg',
    header:
      'bg-gray-50 dark:bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-muted)]',
    cell: 'px-4 py-3 text-[var(--text)]',
    row: 'hover:bg-[var(--surface-2)] transition-colors duration-150',
  },
};

// Utility functions for consistent styling
export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Standard spacing utilities that match dashboard
export const standardSpacing = {
  section: 'mb-8',
  card: 'mb-6',
  element: 'mb-4',
  tight: 'mb-2',
};

// Standard layout utilities
export const standardLayout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8',
  grid: {
    cols1: 'grid grid-cols-1 gap-6',
    cols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },
};

// Standard animation utilities
export const standardAnimations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  hover: 'transition-all duration-300 hover:scale-105',
};

// Helper function to create consistent stat blocks like dashboard
export const createStatBlockClasses = (
  color: 'default' | 'green' | 'blue' | 'purple' | 'orange' = 'default'
) => {
  const colorMap = {
    default: 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700',
    green: 'border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/20',
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20',
    purple: 'border-purple-200 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20',
    orange: 'border-orange-200 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20',
  };

  return cn(
    standardComponents.card.base,
    standardComponents.card.hover,
    standardComponents.card.padding.lg,
    colorMap[color],
    'relative overflow-hidden'
  );
};

// Helper function to create consistent page headers like dashboard
export const createPageHeaderClasses = () => {
  return cn(standardComponents.header.wrapper);
};

// Helper function to create consistent action buttons
export const createActionButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
  return cn(
    standardComponents.button.base,
    variant === 'primary' ? standardComponents.button.primary : standardComponents.button.secondary,
    standardComponents.button.sizes.md
  );
};

const themeUtils = {
  standardColors,
  standardComponents,
  cn,
  standardSpacing,
  standardLayout,
  standardAnimations,
  createStatBlockClasses,
  createPageHeaderClasses,
  createActionButtonClasses,
};

export default themeUtils;
