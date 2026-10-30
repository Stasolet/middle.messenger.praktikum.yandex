import { defineConfig, mergeConfig } from 'vitest/config';
import type { UserConfig } from 'vite';
import viteConfigImport from './vite.config.js';

// Тесты живут рядом с модулями (src/**/*.test.ts), окружение — браузерное:
// компонентам и транспорту нужны DOM и глобальные классы.
const viteConfig = viteConfigImport as UserConfig;

export default defineConfig(
  mergeConfig(viteConfig, {
    test: {
      environment: 'happy-dom',
      include: ['**/*.test.ts'],
    },
  })
);
