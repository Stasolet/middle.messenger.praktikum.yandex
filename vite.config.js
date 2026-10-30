import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const indexPath = resolve(import.meta.dirname, 'src/styles/global.scss');

export default defineConfig({
  root: 'src',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${indexPath}" as *;`,
      },
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
  },
  plugins: [
    {
      name: 'vite-plugin-hbs-raw',
      transform(code, id) {
        // Если файл заканчивается на .hbs, читаем его и отдаем как строку
        if (id.endsWith('.hbs')) {
          const template = fs.readFileSync(id, 'utf-8');
          // JSON.stringify безопасно экранирует все переносы строк, кавычки и ${}
          return `export default ${JSON.stringify(template)};`;
        }
      },
    },
  ],
});
