import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', 'coverage', 'sandbox'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'error',
      semi: ['error', 'always'],
      'eol-last': ['error', 'always'],
    },
  },
  // Заглушка API — Node-скрипт: браузерных глобалов (`Buffer`, `process`) у него нет
  {
    files: ['mocks/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  // 3. Конфигурация для TypeScript файлов
  {
    files: ['**/*.{ts,mts,cts}'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      // Правило member-delimiter-style просто удалено отсюда
    },
  },
]);
