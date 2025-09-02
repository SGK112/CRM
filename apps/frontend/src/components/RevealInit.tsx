'use client';
import { useEffect } from 'react';

/**
 * Initializes intersection-based reveal animations for elements
 * with [data-reveal] attribute. Keeps page.tsx as a Server Component.
 */
export function RevealInit() {
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll('[data-reveal]')) as HTMLElement[];

    if (prefersReduced) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
