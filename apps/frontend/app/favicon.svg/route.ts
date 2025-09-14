import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#g)"/>
  <!-- Resolving/Rotating icon representation -->
  <g fill="#fff">
    <path d="M32 16 L40 24 L36 24 L36 32 L28 32 L28 24 L24 24 Z" opacity="0.9"/>
    <path d="M48 32 L40 40 L40 36 L32 36 L32 28 L40 28 L40 24 Z" opacity="0.7"/>
    <path d="M32 48 L24 40 L28 40 L28 32 L36 32 L36 40 L40 40 Z" opacity="0.5"/>
    <path d="M16 32 L24 24 L24 28 L32 28 L32 36 L24 36 L24 40 Z" opacity="0.3"/>
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}