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

// Export as default
export default {
  MobileNav,
  MobileSearch,
};
