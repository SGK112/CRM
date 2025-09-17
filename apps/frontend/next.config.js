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

  // Build optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Speed up builds
  swcMinify: true,
  
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

  // Experimental features for faster builds
  experimental: {
    // Enable SWC for faster compilation
    forceSwcTransforms: true,
    // Optimize server components
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Add aliases for faster resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'), // eslint-disable-line
    };

    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
        },
      };
    }

    // Exclude large dependencies from bundle analysis
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };

    return config;
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
      // Proxy OAuth endpoints to backend so clients can use relative '/auth/*'
      {
        source: '/auth/:path*',
        destination: `${apiUrl}/auth/:path*`,
      },
    ];
  },

  // Headers for better caching
  async headers() {
    return [
      // Ensure manifest.json is served with correct headers
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      // Favicon headers
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // In development, avoid aggressive caching to prevent stale chunks
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ] : []),
    ];
  },
};

module.exports = nextConfig;
