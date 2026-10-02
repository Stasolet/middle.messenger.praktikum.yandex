import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', 'coverage'],
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
      "eol-last": ["error", "always"]
    },
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
