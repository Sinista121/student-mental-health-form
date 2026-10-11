import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    svelte(), 
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
