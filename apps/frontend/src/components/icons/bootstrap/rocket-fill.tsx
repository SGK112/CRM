// Bootstrap Icons: rocket-fill.svg (MIT License)
// Source: https://github.com/twbs/icons
'use client';
import * as React from 'react';
import { IconProps } from './rocket';

export const BiRocketFill: React.FC<IconProps> = ({
  size = 20,
  className = '',
  title = 'Rocket (Filled)',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    role="img"
    aria-label={title}
    fill="currentColor"
    className={className}
  >
    <path d="M12.612 1.283a1 1 0 0 0-1.175-.902c-2.025.363-3.725 1.844-4.927 3.642a12.5 12.5 0 0 0-1.533 3.98l-.691.276a1.5 1.5 0 0 0-.777.746L2.5 11l.793.793 1.1-.524a1.5 1.5 0 0 0 .746-.777l.276-.691a12.5 12.5 0 0 0 3.98-1.533c1.798-1.202 3.279-2.902 3.642-4.927a1 1 0 0 0-.923-1.158z" />
    <path d="M5.5 13a1.5 1.5 0 0 1-3 0c0-.59.387-1.09.5-1.371L2.75 11.5a.5.5 0 0 1 .5-.5h.5v.5c0 .28.22.5.5.5h.5v.5M9 3.5c.828 0 1.5.895 1.5 2s-.672 2-1.5 2-1.5-.895-1.5-2 .672-2 1.5-2M13.5 10a1.5 1.5 0 0 1-3 0c0-.59.387-1.09.5-1.371l-.25-.129a.5.5 0 0 1 .5-.5h.5v.5c0 .28.22.5.5.5h.5v.5" />
  </svg>
);

export default BiRocketFill;
