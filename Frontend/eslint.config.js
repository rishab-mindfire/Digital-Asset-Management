import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      prettier: prettierPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

  rules: {
  'prettier/prettier': ['error', { endOfLine: 'lf' }],

  semi: ['error', 'always'],
  quotes: ['error', 'single'],

  'no-unused-vars': 'off',

  'no-console': ['warn', { allow: ['warn', 'error'] }],

  eqeqeq: ['error', 'always'],
  curly: ['error', 'all'],

  'max-depth': ['error', 3],

  complexity: ['warn', 20],

  '@typescript-eslint/no-explicit-any': 'warn',

  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
    },
  ],
},
  },
]);
