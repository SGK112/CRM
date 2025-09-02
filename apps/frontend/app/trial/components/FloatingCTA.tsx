'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function FloatingCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-700 shadow-lg p-4 z-50 md:hidden">
      <Link
        href="/auth/register"
        className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold text-center block transition-colors shadow shadow-amber-600/30"
      >
        Start Free Trial - No Credit Card
      </Link>
    </div>
  );
}
