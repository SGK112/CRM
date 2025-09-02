'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageVisitRecord {
  path: string;
  lastVisited: number;
  count: number;
}

const PAGE_HISTORY_KEY = 'copilot_page_history_v1';
const MAX_PAGES = 50;

export default function RouteMemoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !pathname.startsWith('/')) return;
    try {
      const raw = localStorage.getItem(PAGE_HISTORY_KEY);
      let history: PageVisitRecord[] = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      const existing = history.find(h => h.path === pathname);
      if (existing) {
        existing.lastVisited = now;
        existing.count += 1;
      } else {
        history.push({ path: pathname, lastVisited: now, count: 1 });
      }
      history = history.sort((a, b) => b.lastVisited - a.lastVisited).slice(0, MAX_PAGES);
      localStorage.setItem(PAGE_HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* noop */
    }
  }, [pathname]);

  return null;
}
