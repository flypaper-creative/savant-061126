import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      overlay: true
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      'lucide-react',
      'motion/react',
      'd3'
    ]
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/d3')) return 'd3';
          if (id.includes('node_modules/motion')) return 'motion';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  }
});
