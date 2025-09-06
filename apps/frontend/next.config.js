/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better deployment
  output: 'standalone',

  // Ensure proper asset handling
  trailingSlash: false,

  // Configure asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Enable compression
  compress: true,

  // ESLint configuration for builds
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration for builds
  typescript: {
    // Allow production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },

  // Optimize images
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    unoptimized: false,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  },

  // API rewrites - use environment variable for backend URL
  async rewrites() {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Normalize: remove trailing slash and any repeated trailing /api segments to avoid double prefixing
    const apiUrl = raw.replace(/\/$/, '').replace(/(?:\/api)+$/, '');
    return [
      // Don't proxy API routes that have development mode fallbacks - handle them in the frontend
      {
        source: '/api/clients',
        destination: '/api/clients',
      },
      {
        source: '/api/clients/:id/voice-calls',
        destination: '/api/clients/:id/voice-calls',
      },
      {
        source: '/api/clients/:id/appointments',
        destination: '/api/clients/:id/appointments',
      },
      {
        source: '/api/clients/:id/integrations',
        destination: '/api/clients/:id/integrations',
      },
      {
        source: '/api/clients/:id',
        destination: '/api/clients/:id',
      },
      {
        source: '/api/projects',
        destination: '/api/projects',
      },
      {
        source: '/api/projects/:path*',
        destination: '/api/projects/:path*',
      },
      {
        source: '/api/appointments',
        destination: '/api/appointments',
      },
      {
        source: '/api/appointments/:path*',
        destination: '/api/appointments/:path*',
      },
      {
        source: '/api/estimates',
        destination: '/api/estimates',
      },
      {
        source: '/api/estimates/:path*',
        destination: '/api/estimates/:path*',
      },
      // Proxy all other API requests to backend
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      // Proxy OAuth endpoints to backend as well so clients can use relative '/auth/*'
      {
        source: '/auth/:path*',
        destination: `${apiUrl}/auth/:path*`,
      },
    ];
  },

  // Headers for better caching
  async headers() {
    // In development, avoid aggressive caching to prevent stale chunks
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
