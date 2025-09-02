// Comprehensive mobile optimization utilities for CRM

interface MobileNavProps {
  onClose?: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <div className="mobile-nav" onClick={onClose}>
      <p>Mobile navigation placeholder</p>
    </div>
  );
}

interface MobileSearchProps {
  onClose?: () => void;
}

export function MobileSearch({ onClose }: MobileSearchProps) {
  return (
    <div className="mobile-search" onClick={onClose}>
      <p>Mobile search placeholder</p>
    </div>
  );
}

// Core mobile optimization utility
export const mobileOptimized = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Enhanced mobile utility objects for app-like experience
export const mobile = {
  // Touch targets - 44px minimum for accessibility
  touchTarget: (...classes: string[]) =>
    mobileOptimized('min-h-[44px] min-w-[44px] touch-manipulation', ...classes),

  // Scroll containers with momentum - enhanced for mobile
  scrollContainer: (...classes: string[]) =>
    mobileOptimized(
      'overflow-y-auto overflow-x-hidden overscroll-contain',
      'scroll-smooth will-change-scroll transform-gpu',
      'scrollbar-none mobile-sidebar-scroll',
      ...classes
    ),

  // Performance optimizations
  willChange: (...classes: string[]) => mobileOptimized('will-change-transform', ...classes),

  // Safe areas for notched devices
  safeTop: (...classes: string[]) =>
    mobileOptimized(
      'pt-safe-top',
      'supports-[padding-top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]',
      ...classes
    ),

  safeBottom: (...classes: string[]) =>
    mobileOptimized(
      'pb-safe-bottom',
      'supports-[padding-bottom:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]',
      ...classes
    ),

  // App-like card shadows and interactions
  card: (...classes: string[]) =>
    mobileOptimized(
      'bg-white dark:bg-gray-800',
      'rounded-2xl shadow-lg',
      'border border-gray-200/50 dark:border-gray-700/50',
      'transition-all duration-200',
      'active:scale-[0.98] active:shadow-md',
      ...classes
    ),

  // Smooth button interactions
  button: (...classes: string[]) =>
    mobileOptimized(
      'rounded-xl transition-all duration-200',
      'active:scale-95 touch-manipulation',
      'shadow-sm hover:shadow-md',
      ...classes
    ),

  // Optimized text sizing for mobile
  text: {
    title: (...classes: string[]) =>
      mobileOptimized('text-xl sm:text-2xl font-bold tracking-tight', ...classes),
    subtitle: (...classes: string[]) =>
      mobileOptimized('text-sm sm:text-base text-gray-600 dark:text-gray-400', ...classes),
    body: (...classes: string[]) =>
      mobileOptimized('text-sm sm:text-base leading-relaxed', ...classes),
  },

  // App-like navigation
  navigation: (...classes: string[]) =>
    mobileOptimized(
      'sticky top-0 z-50 backdrop-blur-xl',
      'bg-white/90 dark:bg-gray-900/90',
      'border-b border-gray-200/50 dark:border-gray-700/50',
      ...classes
    ),

  // Bottom sheet style containers
  bottomSheet: (...classes: string[]) =>
    mobileOptimized(
      'fixed inset-x-0 bottom-0 z-50',
      'bg-white dark:bg-gray-900',
      'rounded-t-3xl shadow-2xl',
      'border-t border-gray-200 dark:border-gray-700',
      ...classes
    ),

  // Optimized spacing for mobile
  spacing: {
    page: (...classes: string[]) =>
      mobileOptimized('px-4 sm:px-6 lg:px-8 py-4 sm:py-6', ...classes),
    card: (...classes: string[]) => mobileOptimized('p-4 sm:p-6', ...classes),
    tight: (...classes: string[]) => mobileOptimized('p-3 sm:p-4', ...classes),
  },
};

export const mobileClasses = {
  touchTarget: (...classes: string[]) => classes.filter(Boolean).join(' '),
  padding: {
    sm: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  card: {
    container: (...classes: string[]) => classes.filter(Boolean).join(' '),
    body: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  text: {
    heading: (...classes: string[]) => classes.filter(Boolean).join(' '),
    subheading: (...classes: string[]) => classes.filter(Boolean).join(' '),
    body: (...classes: string[]) => classes.filter(Boolean).join(' '),
    small: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  button: {
    primary: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  form: {
    label: (...classes: string[]) => classes.filter(Boolean).join(' '),
    input: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  grid: {
    cards: (...classes: string[]) => classes.filter(Boolean).join(' '),
    list: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  container: {
    responsive: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
};

export const responsive = {
  padding: {
    sm: (...classes: string[]) => classes.filter(Boolean).join(' '),
    md: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  spacing: {
    xs: (...classes: string[]) => classes.filter(Boolean).join(' '),
    sm: (...classes: string[]) => classes.filter(Boolean).join(' '),
  },
  showOnMobile: (...classes: string[]) => classes.filter(Boolean).join(' '),
  hideOnMobile: (...classes: string[]) => classes.filter(Boolean).join(' '),
};

// Add MobileComponents export for compatibility
export const MobileComponents = {
  MobileNav,
  MobileSearch,
};
