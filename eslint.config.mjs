import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 拿到各插件的 recommended 规则集（Flat Config 下自己拼）
const reactRecommended = react.configs.recommended?.rules ?? {};
const reactHooksRecommended = reactHooks.configs.recommended?.rules ?? {};
const jsxA11yRecommended = jsxA11y.configs.recommended?.rules ?? {};
const importRecommended = importPlugin.configs.recommended?.rules ?? {};
const importTypescript = importPlugin.configs.typescript?.rules ?? {};

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },

  // JS/TS 推荐规则
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 你的项目规则
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.node },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        alias: {
          map: [['@', './src']], // ✅ 告诉 ESLint “@” 代表 src
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: { alwaysTryTypes: true },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },

    rules: {
      // 相当于：plugin:react/recommended
      ...reactRecommended,
      // 相当于：plugin:react-hooks/recommended
      ...reactHooksRecommended,
      // 相当于：plugin:jsx-a11y/recommended
      ...jsxA11yRecommended,
      // 相当于：plugin:import/recommended + plugin:import/typescript
      ...importRecommended,
      ...importTypescript,

      // 你的自定义微调
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
        },
      ],
    },
  },

  // ✅ 别再展开，直接放一个元素即可
  prettier,
];

export default eslintConfig;
