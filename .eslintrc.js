module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': 'warn',
  'no-console': 'warn',
  'react/no-unescaped-entities': 'off',
  'prefer-const': 'warn',
  },
  overrides: [
    {
      files: ['apps/frontend/**/*'],
      extends: [
        'next/core-web-vitals',
      ],
      env: {
        browser: true,
      },
      rules: {
        'react/no-unescaped-entities': 'off',
      }
    },
  ],
};
