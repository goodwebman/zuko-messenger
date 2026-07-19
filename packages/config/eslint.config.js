import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Базовый flat-config. Пакеты/приложения расширяют его своими правилами
 * (react-hooks, next и т.д.).
 * @type {import('typescript-eslint').ConfigArray}
 */
export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
);
