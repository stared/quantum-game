import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Ensure UMD modules get proper context
        format: 'es',
      },
    },
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      // Support for legacy imports if needed
    },
  },
  optimizeDeps: {
    include: ['d3'],
    esbuildOptions: {
      // Inject window as this for D3 v3 UMD module
      inject: ['./js/d3-shim.js'],
    },
  },
  define: {
    // Ensure browser globals are available
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
