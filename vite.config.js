import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import chatsMock from './src/mocks/chats.json' assert { type: 'json' };

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: './src/conponents',
      context: {
        siteTitle: 'Мой проект',
        chats: chatsMock,
      },
    }),
  ],
  // Корень для сборки (обычно src)
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        index: 'src/pages/index/index.hbs',
        chat: 'src/layouts/sidebar/sidebar.hbs',
      },
    },
  },
});