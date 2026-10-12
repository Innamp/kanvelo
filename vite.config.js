import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load cleanly on GitHub Pages and any subfolder
  server: {
    port: 5173,
    open: false,
    watch: {
      ignored: ['**/*.xlsx', '**/.git/**']
    }
  }
});
