// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import node from '@astrojs/node';

// Pages statiques pré-rendues par défaut ; seules les routes `/api/*`
// (marquées `prerender = false`) sont servies par le serveur Node.
export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
  server: { port: 4840 },
  devToolbar: { enabled: false },
});
