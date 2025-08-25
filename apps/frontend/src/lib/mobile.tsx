/**
 * Mobile Responsive Utilities for CRM
 * 
 * This module provides utilities and patterns for consistent mobile optimization
 * across the CRM application without breaking existing functionality.
 */

import React from 'react';

// Mobile breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Mobile-first responsive classes for common patterns
export const mobileClasses = {
  // Container patterns
  container: {
    responsive: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    mobile: 'px-4 sm:px-6',
    desktop: 'px-6 lg:px-8'
  },
  
  // Grid patterns
  grid: {
    cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
    list: 'grid grid-cols-1 gap-4 sm:gap-6',
    twoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
    sidebar: 'grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6'
  },
  
  // Text patterns
  text: {
    heading: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    subheading: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm'
  },
  
  // Button patterns
  button: {
    primary: 'px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base',
    secondary: 'px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm',
    icon: 'p-2 sm:p-3'
  },
  
  // Table patterns
  table: {
    container: 'overflow-x-auto -mx-4 sm:mx-0',
    wrapper: 'min-w-full inline-block align-middle',
    cell: 'px-3 py-4 sm:px-6 text-sm',
    header: 'px-3 py-3 sm:px-6 text-xs sm:text-sm font-medium uppercase tracking-wider'
  },
  
  // Form patterns
  form: {
    container: 'space-y-4 sm:space-y-6',
    field: 'w-full',
    label: 'block text-sm font-medium mb-1 sm:mb-2',
    input: 'w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
    row: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
  },
  
  // Modal patterns
  modal: {
    backdrop: 'fixed inset-0 z-50 overflow-y-auto',
    container: 'flex min-h-full items-center justify-center p-4 sm:p-6',
    content: 'w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl'
  },
  
  // Card patterns
  card: {
    container: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
    header: 'px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700',
    body: 'p-4 sm:p-6',
    footer: 'px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-700'
  },
  
  // Navigation patterns
  nav: {
    mobile: 'block lg:hidden',
    desktop: 'hidden lg:block',
    mobileMenu: 'lg:hidden',
    desktopMenu: 'hidden lg:flex'
  }
} as const;

// Responsive helper functions
export const responsive = {
  // Show/hide based on screen size
  showOnMobile: 'block sm:hidden',
  hideOnMobile: 'hidden sm:block',
  showOnTablet: 'hidden sm:block lg:hidden', 
  showOnDesktop: 'hidden lg:block',
  
  // Flex patterns
  flexCol: 'flex flex-col sm:flex-row',
  flexRow: 'flex flex-row',
  
  // Spacing patterns
  spacing: {
    xs: 'space-y-2 sm:space-y-3',
    sm: 'space-y-3 sm:space-y-4', 
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8',
    xl: 'space-y-8 sm:space-y-12'
  },
  
  // Padding patterns
  padding: {
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  }
} as const;

// Mobile optimization utilities
export const mobile = {
  // Touch-friendly sizes
  touchTarget: 'min-h-[44px] min-w-[44px]', // iOS/Android recommended minimum
  
  // Safe areas for notched devices
  safeTop: 'pt-safe-top',
  safeBottom: 'pb-safe-bottom',
  
  // Scroll optimization
  scrollContainer: 'overflow-y-auto overscroll-contain',
  scrollSnap: 'scroll-smooth snap-y snap-mandatory',
  
  // Performance optimizations
  willChange: 'will-change-transform',
  backfaceHidden: 'backface-visibility-hidden',
  
  // Mobile-specific interactions
  noSelect: 'select-none',
  noZoom: 'touch-manipulation',
  
  // Typography scaling
  textScale: {
    xs: 'text-xs leading-4',
    sm: 'text-sm leading-5', 
    base: 'text-base leading-6',
    lg: 'text-lg leading-7'
  }
} as const;

// Utility function to combine mobile classes
export function mobileOptimized(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Hook for detecting mobile viewport
export function useIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
}

// Mobile-optimized component patterns
export const MobileComponents = {
  // Mobile-friendly table wrapper
  ResponsiveTable: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={mobileOptimized(mobileClasses.table.container, className)}>
      <div className={mobileClasses.table.wrapper}>
        {children}
      </div>
    </div>
  ),
  
  // Mobile-friendly modal
  ResponsiveModal: ({ 
    children, 
    isOpen, 
    onClose,
    size = 'md' 
  }: { 
    children: React.ReactNode; 
    isOpen: boolean;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md sm:max-w-lg',
      lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
      xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl'
    };
    
    return (
      <div className={mobileClasses.modal.backdrop}>
        <div className={mobileClasses.modal.container}>
          <div className={mobileOptimized(
            mobileClasses.modal.content,
            sizeClasses[size],
            mobileClasses.card.container
          )}>
            {children}
          </div>
        </div>
      </div>
    );
  },
  
  // Mobile-friendly card grid
  ResponsiveCardGrid: ({ 
    children,
    columns = 'auto',
    gap = 'md'
  }: {
    children: React.ReactNode;
    columns?: 'auto' | '1' | '2' | '3' | '4';
    gap?: 'sm' | 'md' | 'lg';
  }) => {
    const columnClasses = {
      auto: mobileClasses.grid.cards,
      '1': 'grid grid-cols-1 gap-4 sm:gap-6',
      '2': 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
      '3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
      '4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
    };
    
    return (
      <div className={columnClasses[columns]}>
        {children}
      </div>
    );
  }
};

export default {
  breakpoints,
  mobileClasses,
  responsive,
  mobile,
  mobileOptimized,
  useIsMobile,
  MobileComponents
};
