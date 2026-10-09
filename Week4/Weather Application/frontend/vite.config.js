import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend only ever talks to OUR backend (never OpenWeatherMap directly),
// which keeps the API key server-side. In dev, /api is proxied to :5000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
