import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs make the build work both on localhost and on
  // GitHub Pages project sites such as /Vid-os/.
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        formacad: 'formacad.html'
      }
    }
  }
});
