import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Global ESLint settings
  {
    linterOptions: {
      noInlineConfig: true, // Prevents inline comments from changing config
      reportUnusedDisableDirectives: true, // Reports unused eslint-disable comments
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Files to ignore
  {
    ignores: [
      // Build outputs
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',

      // Cache and temp files
      '**/.turbo/**',
      '**/.DS_Store',
      '.now/*',

      // Assets and static files
      '**/*.css',
      'public/*',
      'esm/*',

      // Config files (but keep important ones)
      '**/*.config.js',
      '**/scripts/**',
      '**/.changeset/**',
      'tests/*',

      // Explicitly include important config files
      '!**/.storybook',
      '!**/.storybook/**/*',
      '!**/.commitlintrc.cjs',
      '!**/.lintstagedrc.cjs',
      '!**/jest.config.js',
      '!**/plopfile.js',
      '!**/react-shim.js',
      '!**/tsup.config.ts',

      // Specific app files
      'apps/docs/preinstall.js',
      'apps/docs/next-redirect.js',
    ],
  },

  // Core rules
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),

  // Additional strict rules
  {
    rules: {
      // Error prevention
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Best practices
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      // Modern JavaScript
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': ['error', 'always'],

      // Import/Export
      'import/no-default-export': 'warn',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // React specific
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-unused-prop-types': 'error',

      // Performance
      'react/jsx-no-constructed-context-values': 'error',
      'react/jsx-no-useless-fragment': 'error',
    },
  },
];
