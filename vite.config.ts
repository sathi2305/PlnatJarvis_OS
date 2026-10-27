import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { plantTwinApiPlugin } from './src/vite-plugin-api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), plantTwinApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        classic: resolve(__dirname, 'classic.html'),
        notfound: resolve(__dirname, '404.html'),
      },
    },
  },
});
