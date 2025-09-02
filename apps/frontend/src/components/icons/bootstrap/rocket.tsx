// Bootstrap Icons: rocket.svg (MIT License)
// Source: https://github.com/twbs/icons
'use client';
import * as React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  title?: string;
}

export const BiRocket: React.FC<IconProps> = ({ size = 20, className = '', title = 'Rocket' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    role="img"
    aria-label={title}
    fill="currentColor"
    className={className}
  >
    <path d="M4.36 4.07a.5.5 0 0 0-.69.278L3.22 6H1.5a.5.5 0 0 0-.485.379l-1 4A.5.5 0 0 0 .5 11h1.655l-.243.97a.5.5 0 0 0 .812.494L4.36 11.93a2.5 2.5 0 0 1 1.43-.43h2.42c.524 0 1.036.15 1.469.43l1.636 1.534a.5.5 0 0 0 .812-.494L11.845 11H13.5a.5.5 0 0 0 .485-.621l-1-4A.5.5 0 0 0 12.5 6h-1.72l-.45-1.652a.5.5 0 0 0-.69-.278l-.396.198A3 3 0 0 1 8.277 4h-.554a3 3 0 0 1-1.367-.732z" />
    <path d="M5.795 12.456c-.398.04-.778.176-1.087.397L2.636 14.39A1.5 1.5 0 0 1 .28 13.028l.97-3.882A1.5 1.5 0 0 1 2.712 8h1.004l-.356 1.422a.5.5 0 0 0 .49.621h1.095c.147.7.463 1.395.95 2.067-.033.002-.066.005-.1.01m4.41 0c.398.04.778.176 1.087.397l2.072 1.536a1.5 1.5 0 0 0 2.356-1.362l-.97-3.882A1.5 1.5 0 0 0 13.288 8h-1.004l.356 1.422a.5.5 0 0 1-.49.621h-1.095a5.48 5.48 0 0 1-.95 2.067c.033.002.066.005.1.01M6.646 5.146 8 6.5l1.354-1.354a.5.5 0 0 0-.708-.708L8 5.793 7.354 5.146a.5.5 0 1 0-.708.708" />
  </svg>
);

export default BiRocket;
