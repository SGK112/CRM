'use client';

import Link from 'next/link';
import React from 'react';
import { HomeIcon } from '@heroicons/react/24/solid';

interface LogoProps {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ className = '', compact = false, onClick }) => {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group inline-flex items-center font-bold select-none ${className}`}
    >
      <span className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/40 ring-2 ring-white/20 dark:ring-orange-400/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/60 group-hover:scale-105">
        <HomeIcon className="h-5 w-5 drop-shadow-sm" />
      </span>
      {!compact && (
        <span className="ml-2 tracking-tight text-gray-900 dark:text-gray-100 font-semibold group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
          Remodely Ai
        </span>
      )}
    </Link>
  );
};

export default Logo;
