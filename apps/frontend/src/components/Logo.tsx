'use client';

import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
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
      className={`group inline-flex items-center font-bold text-gray-900 select-none ${className}`}
    >
  <span className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-white/10">
        <WrenchScrewdriverIcon className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="ml-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 group-hover:from-gray-800 group-hover:via-gray-700 group-hover:to-gray-500 transition-colors">
          ConstructCRM
        </span>
      )}
    </Link>
  );
};

export default Logo;
