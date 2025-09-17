const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  externals: {
    // Don't bundle native dependencies
    'mongodb-client-encryption': 'mongodb-client-encryption',
    '@mongodb-js/zstd': '@mongodb-js/zstd',
    'kerberos': 'kerberos',
    '@aws-sdk/credential-providers': '@aws-sdk/credential-providers',
    'snappy': 'snappy',
    'aws4': 'aws4',
    'bson-ext': 'bson-ext',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimization: {
    minimize: false, // Keep false for easier debugging in production
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource: (resource) => {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/websockets/socket-module',
          'cache-manager',
          'class-validator',
          'class-transformer/storage',
        ];
        return lazyImports.some((lib) => resource.startsWith(lib));
      },
    }),
  ],
};