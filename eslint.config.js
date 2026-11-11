import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  // Folders ESLint must never look inside.
  { ignores: ['**/node_modules/**', '**/dist/**'] },

  // The official recommended rules, applied everywhere.
  js.configs.recommended,

  // Frontend files: browser names are allowed, JSX is understood.
  {
    files: ['client/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Names starting with a capital letter are usually React components,
      // which ESLint cannot see being used inside JSX, so we skip them here.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // Backend files: Node names (process, console) are allowed.
  {
    files: ['server/**/*.js'],
    languageOptions: { globals: globals.node },
  },

  // Must come last: switches off style rules that Prettier already handles.
  prettier,
];
