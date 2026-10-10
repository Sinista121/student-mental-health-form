import { defineConfig } from 'vite';

// Static single-page build. Vercel auto-detects Vite and serves ./dist.
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
