import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

export default defineConfig({
  build: {
    // Keep bundled JS apart from public/assets (game art + manifest).
    assetsDir: 'bundle',
    // Phaser alone is ~1.2MB; keep the warning for anything bigger than that.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        teacher: resolve(root, 'teacher.html'),
      },
    },
  },
});
