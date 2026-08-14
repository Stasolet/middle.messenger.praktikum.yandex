import { defineConfig } from 'vite';
import { resolve } from 'path';
import chatsMock from './src/mocks/chats.json' assert { type: 'json' };

export default defineConfig({
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        main:    resolve(import.meta.dirname, 'src/index.html'),
        login:   resolve(import.meta.dirname, 'src/pages/login/login.html'),
        chat:    resolve(import.meta.dirname, 'src/pages/chat/chat.html'),
        profile: resolve(import.meta.dirname, 'src/pages/profile/profile.html'),
        error:   resolve(import.meta.dirname, 'src/pages/error/error.html'),
      },
    },
  },
});