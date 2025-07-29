import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // يجعل كل الروابط نسبية ليعمل على GitHub Pages
  build: {
    outDir: 'dist',
  },
});
