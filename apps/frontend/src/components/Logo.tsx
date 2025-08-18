'use client';

import { BiRocket } from './icons/bootstrap';
import Link from 'next/link';
import React from 'react';

interface LogoProps {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ className = '', compact = false, onClick }) => {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className={`group inline-flex items-center font-bold select-none ${className}`}
    >
      <span className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white shadow-sm shadow-amber-500/30 ring-1 ring-white/10 dark:ring-amber-400/20">
        <BiRocket size={20} className="transition-transform group-hover:scale-110" />
      </span>
      {!compact && (
        <span className="ml-2 tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          Remodely CRM
        </span>
      )}
    </Link>
  );
};

export default Logo;
