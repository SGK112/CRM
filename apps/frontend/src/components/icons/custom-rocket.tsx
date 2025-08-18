'use client';
import * as React from 'react';

export interface CustomRocketProps {
  size?: number;
  className?: string;
  title?: string;
}

export const CustomRocket: React.FC<CustomRocketProps> = ({ 
  size = 20, 
  className = '', 
  title = 'Rocket' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
    fill="currentColor"
    className={className}
  >
    {/* Optimized rocket design for small sizes */}
    <g strokeLinejoin="round">
      {/* Main body */}
      <path d="M12 2c2.5 2.5 4.5 7.5 4.5 12s-2 10-4.5 12c-2.5-2.5-4.5-7-4.5-12s2-9.5 4.5-12Z" />
      {/* Window */}
      <circle cx="12" cy="10" r="2.5" fill="currentColor" opacity="0.3"/>
      <circle cx="11.2" cy="9.2" r="0.8" fill="currentColor" opacity="0.6"/>
      {/* Side fins */}
      <path d="M6 16c1-1.5 2.5-2.5 4-3v4c-1.5 0-3 0.5-4 1v-2Z" opacity="0.7"/>
      <path d="M18 16c-1-1.5-2.5-2.5-4-3v4c1.5 0 3 0.5 4 1v-2Z" opacity="0.7"/>
      {/* Exhaust flame */}
      <path d="M12 22c1.5 0 2.8 1 2.8 2.2S13.5 26.4 12 26.4s-2.8-1-2.8-2.2S10.5 22 12 22Z" fill="#F59E0B"/>
    </g>
  </svg>
);

export default CustomRocket;
