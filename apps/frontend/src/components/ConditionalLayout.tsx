'use client';

import { usePathname } from 'next/navigation';
import { TopBar } from './top-bar';

export function ConditionalTopBar() {
  const pathname = usePathname();
  
  // Don't show TopBar on dashboard pages, trial pages, demo pages, or if no pathname available
  if (!pathname || pathname.startsWith('/dashboard') || pathname.startsWith('/trial') || pathname.startsWith('/demo')) {
    return null;
  }
  
  return <TopBar />;
}

export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages, trial pages, demo pages, or if no pathname available
  if (!pathname || pathname.startsWith('/dashboard') || pathname.startsWith('/trial') || pathname.startsWith('/demo')) {
    return null;
  }
  
  return <>{children}</>;
}
