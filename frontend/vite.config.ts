import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@/components', replacement: path.resolve(__dirname, './src/app/components') },
      { find: '@/ui', replacement: path.resolve(__dirname, './src/components/ui') },
      { find: '@/common', replacement: path.resolve(__dirname, './src/app/components/common') },
      { find: '@/state', replacement: path.resolve(__dirname, './src/app/state') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/app/hooks') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@/app/lib', replacement: path.resolve(__dirname, './src/app/lib') },
      { find: '@/pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: '@/hooks-root', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          audio: ['howler', 'wavesurfer.js'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': {},
  },
});