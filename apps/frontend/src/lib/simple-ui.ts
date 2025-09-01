/**
 * Simple UI System - Uniform and Professional Design Library
 * Provides consistent styling across all CRM pages
 */

// Base page layout
export const simple = {
  // Page containers
  page: (className = '') => `min-h-screen p-4 sm:p-6 lg:p-8 ${className}`,
  
  // Card components
  card: (className = '') => `bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`,
  
  // Section spacing
  section: (className = '') => `p-6 ${className}`,
  
  // Typography system
  text: {
    title: (className = '') => `text-2xl font-bold text-gray-900 dark:text-white ${className}`,
    subtitle: (className = '') => `text-lg font-semibold text-gray-900 dark:text-white ${className}`,
    body: (className = '') => `text-gray-600 dark:text-gray-300 ${className}`,
    small: (className = '') => `text-sm text-gray-500 dark:text-gray-400 ${className}`,
    muted: (className = '') => `text-xs text-gray-400 dark:text-gray-500 ${className}`
  },
  
  // Grid systems
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 md:grid-cols-2',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    gap: 'gap-6'
  },
  
  // Spacing utilities
  spacing: {
    xs: 'space-y-2',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
    xl: 'space-y-12'
  },
  
  // Button styles
  button: (variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary', className = '') => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
    };
    return `px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${variants[variant]} ${className}`;
  },
  
  // Form inputs
  input: (className = '') => `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`,
  
  // Status badges
  badge: (variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral', className = '') => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return `inline-flex px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`;
  },
  
  // Loading states
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-blue-600 border-t-transparent',
    container: 'flex items-center justify-center py-12',
    page: 'flex items-center justify-center min-h-screen'
  },
  
  // Empty states
  empty: {
    container: 'text-center py-12',
    icon: 'mx-auto h-12 w-12 text-gray-400 mb-4',
    title: 'text-lg font-medium text-gray-900 dark:text-white mb-2',
    description: 'text-gray-500 dark:text-gray-400 mb-4'
  }
};
