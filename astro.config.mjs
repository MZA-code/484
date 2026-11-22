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
      // Clé Giphy du site : envoyée au navigateur par /api/gif, qui appelle Giphy lui-même
      // (règle de GIPHY pour le web). Une clé web est publique par nature.
      GIPHY_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      OG_CACHE_DIR: envField.string({ context: 'server', access: 'secret', default: 'data/og' }),
      VOTE_HASH_SALT: envField.string({ context: 'server', access: 'secret', optional: true }),
      VOTES_DB_FILE: envField.string({
        context: 'server',
        access: 'secret',
        default: 'data/votes.sqlite',
      }),
      // Jeton qui protège la liste des signalements de GIF (GET /api/gif-report, npm run gif-audit).
      GIF_REPORT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // « true » derrière un proxy (hébergement mutualisé) pour lire l'IP dans X-Forwarded-For.
      TRUST_PROXY: envField.string({ context: 'server', access: 'secret', default: 'false' }),
    },
  },
});
