import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@components', replacement: '/src/components' },
      { find: '@features', replacement: '/src/features' },
      { find: '@utils', replacement: '/src/utils' },
      { find: '@assets', replacement: '/src/assets' },
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
});
