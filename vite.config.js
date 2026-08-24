import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "src/index.html"),
        login: resolve(import.meta.dirname, "src/pages/login/login.html"),
        signin: resolve(import.meta.dirname, "src/pages/signin/signin.html"),
        chat: resolve(import.meta.dirname, "src/pages/chat/chat.html"),
        profile: resolve(import.meta.dirname, "src/pages/profile/profile.html"),
        error_404: resolve(import.meta.dirname, "src/pages/error_404/error_404.html"),
        error_500: resolve(import.meta.dirname, "src/pages/error_500/error_500.html"),
      },
    },
  },
});
