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
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'src/index.html'),
        login: resolve(import.meta.dirname, 'src/pages/login/login.html'),
        signin: resolve(import.meta.dirname, 'src/pages/signin/signin.html'),
        chat: resolve(import.meta.dirname, 'src/pages/chat/chat.html'),
        profile: resolve(import.meta.dirname, 'src/pages/profile/profile.html'),
        error_404: resolve(import.meta.dirname, 'src/pages/error_404/error_404.html'),
        error_500: resolve(import.meta.dirname, 'src/pages/error_500/error_500.html'),
      },
    },
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
