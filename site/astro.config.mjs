import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages at https://<user>.github.io/gantt-charter/
export default defineConfig({
  site: 'https://sami5001.github.io',
  base: '/gantt-charter',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
