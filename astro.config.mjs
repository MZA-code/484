// @ts-check
import { defineConfig, envField } from 'astro/config';
import preact from '@astrojs/preact';
import node from '@astrojs/node';

// Pages statiques pré-rendues par défaut ; seules les routes `/api/*`
// (marquées `prerender = false`) sont servies par le serveur Node.
export default defineConfig({
  // Adresse publique du site : liens canoniques et aperçus de partage (Open Graph).
  site: 'https://team484.fr',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
  server: { port: 4840 },
  devToolbar: { enabled: false },
  env: {
    // Secrets lus au démarrage du serveur (fichier .env ou variables d'environnement),
    // jamais intégrés au code envoyé au navigateur.
    schema: {
      GIPHY_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GIF_CACHE_FILE: envField.string({
        context: 'server',
        access: 'secret',
        default: 'data/gif-cache.json',
      }),
      VOTE_HASH_SALT: envField.string({ context: 'server', access: 'secret', optional: true }),
      VOTES_DB_FILE: envField.string({
        context: 'server',
        access: 'secret',
        default: 'data/votes.sqlite',
      }),
      // « true » derrière un proxy (hébergement mutualisé) pour lire l'IP dans X-Forwarded-For.
      TRUST_PROXY: envField.string({ context: 'server', access: 'secret', default: 'false' }),
    },
  },
});
