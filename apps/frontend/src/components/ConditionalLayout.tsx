'use client';

import { usePathname } from 'next/navigation';
// TopBar now rendered globally in layout; keep placeholder export if imports linger.
export function ConditionalTopBar() { return null; }

export function ConditionalFooter({ children }: { children: React.ReactNode }) { return <>{children}</>; }
