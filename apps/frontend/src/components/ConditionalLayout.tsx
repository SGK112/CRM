'use client';

import { usePathname } from 'next/navigation';
import { TopBar } from './top-bar';

export function ConditionalTopBar() {
  const pathname = usePathname();

  // Hide legacy TopBar on app/marketing pages that provide their own header
  // - dashboard/trial/demo: application shells
  // - public marketing pages (/, /features, /pricing, /docs, etc.) provide their own landing header
  const marketingRoots = [
    '/',
    '/features',
    '/pricing',
    '/about',
    '/demo',
    '/voice-agent-demo',
    '/roadmap',
    '/docs',
    '/integrations',
    '/blog',
    '/support',
    '/status',
    '/legal',
    '/privacy',
    '/terms',
    '/contact',
  ];

  const isMarketing = marketingRoots.some(root =>
    root === '/' ? pathname === '/' : pathname.startsWith(root)
  );
  const isAppShell =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/trial') ||
    pathname?.startsWith('/demo') ||
    pathname?.startsWith('/auth');

  if (!pathname || isAppShell || isMarketing) {
    return null;
  }

  return <TopBar />;
}

export function ConditionalFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show footer on dashboard pages, trial pages, demo pages, or if no pathname available
  if (
    !pathname ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/trial') ||
    pathname.startsWith('/demo')
  ) {
    return null;
  }

  return <>{children}</>;
}
