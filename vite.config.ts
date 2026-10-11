import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Static single-page build. Vercel auto-detects Vite and serves ./dist.
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
