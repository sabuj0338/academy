// Astro 6 — প্রতিটি কোর্স ও lesson-এর জন্য আলাদা static HTML page।
// Lesson player, lab ও 3D হলো React "island" (client:load) — বাকি page সাধারণ HTML।
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sabuj0338.github.io',
  base: '/academy',
  trailingSlash: 'always',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: { chunkSizeWarningLimit: 2000 },
  },
  devToolbar: { enabled: false },
});
