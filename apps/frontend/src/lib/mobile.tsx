// Simple mobile components without hook issues
import React from 'react';

interface MobileNavProps {
  onClose?: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <div className="mobile-nav">
      <p>Mobile navigation placeholder</p>
    </div>
  );
}

interface MobileSearchProps {
  onClose?: () => void;
}

export function MobileSearch({ onClose }: MobileSearchProps) {
  return (
    <div className="mobile-search">
      <p>Mobile search placeholder</p>
    </div>
  );
}

// Mobile-specific utility function for responsive classes
export const mobileOptimized = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Mobile utility objects for compatibility
export const mobile = {
  touchTarget: (...classes: string[]) => classes.filter(Boolean).join(' '),
  scrollContainer: (...classes: string[]) => classes.filter(Boolean).join(' '),
  willChange: (...classes: string[]) => classes.filter(Boolean).join(' '),
  safeTop: (...classes: string[]) => classes.filter(Boolean).join(' '),
  safeBottom: (...classes: string[]) => classes.filter(Boolean).join(' ')
};

export const mobileClasses = {
  touchTarget: (...classes: string[]) => classes.filter(Boolean).join(' '),
  padding: {
    sm: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  card: {
    container: (...classes: string[]) => classes.filter(Boolean).join(' '),
    body: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  text: {
    heading: (...classes: string[]) => classes.filter(Boolean).join(' '),
    subheading: (...classes: string[]) => classes.filter(Boolean).join(' '),
    body: (...classes: string[]) => classes.filter(Boolean).join(' '),
    small: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  button: {
    primary: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  form: {
    label: (...classes: string[]) => classes.filter(Boolean).join(' '),
    input: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  grid: {
    cards: (...classes: string[]) => classes.filter(Boolean).join(' '),
    list: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  container: {
    responsive: (...classes: string[]) => classes.filter(Boolean).join(' ')
  }
};

export const responsive = {
  padding: {
    sm: (...classes: string[]) => classes.filter(Boolean).join(' '),
    md: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  spacing: {
    xs: (...classes: string[]) => classes.filter(Boolean).join(' '),
    sm: (...classes: string[]) => classes.filter(Boolean).join(' ')
  },
  showOnMobile: (...classes: string[]) => classes.filter(Boolean).join(' '),
  hideOnMobile: (...classes: string[]) => classes.filter(Boolean).join(' ')
};

// Add MobileComponents export for compatibility
export const MobileComponents = {
  MobileNav,
  MobileSearch
};
