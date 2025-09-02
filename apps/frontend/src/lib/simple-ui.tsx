/**
 * Simple UI utilities for clean, mobile-optimized components
 * This replaces complex styling with clean, consistent patterns
 */

export const simple = {
  // Clean cards with minimal styling
  card: (additionalClasses = '') =>
    `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 ${additionalClasses}`,

  // Simple page layout
  page: (additionalClasses = '') => `p-4 sm:p-6 ${additionalClasses}`,

  // Clean section spacing
  section: (additionalClasses = '') => `p-4 sm:p-6 ${additionalClasses}`,

  // Simple buttons
  button: (variant: 'primary' | 'secondary' | 'ghost' = 'primary', additionalClasses = '') => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary:
        'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    };

    return `px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${variants[variant]} ${additionalClasses}`;
  },

  // Clean text styles
  text: {
    title: (additionalClasses = '') =>
      `text-2xl font-bold text-gray-900 dark:text-white ${additionalClasses}`,
    subtitle: (additionalClasses = '') =>
      `text-lg font-medium text-gray-700 dark:text-gray-300 ${additionalClasses}`,
    body: (additionalClasses = '') => `text-gray-600 dark:text-gray-400 ${additionalClasses}`,
    small: (additionalClasses = '') =>
      `text-sm text-gray-500 dark:text-gray-500 ${additionalClasses}`,
  },

  // Simple input styles
  input: (additionalClasses = '') =>
    `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${additionalClasses}`,

  // Status badges (to match API expected by pages)
  badge: (
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral',
    additionalClasses = ''
  ) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    } as const;
    return `inline-flex px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${additionalClasses}`;
  },

  // Clean grid layouts
  grid: {
    cols1: 'grid grid-cols-1 gap-4',
    cols2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  },

  // Simple spacing
  spacing: {
    xs: 'space-y-2',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  },

  // Loading states (to match API expected by pages)
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-blue-600 border-t-transparent',
    container: 'flex items-center justify-center py-12',
    page: 'flex items-center justify-center min-h-screen',
  },

  // Empty states (for consistency with other pages)
  empty: {
    container: 'text-center py-12',
    icon: 'mx-auto h-12 w-12 text-gray-400 mb-4',
    title: 'text-lg font-medium text-gray-900 dark:text-white mb-2',
    description: 'text-gray-500 dark:text-gray-400 mb-4',
  },
};
