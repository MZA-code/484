/**
 * Fichier de démarrage pour l'hébergement o2switch (cPanel « Setup Node.js App », Phusion Passenger).
 *
 * Passenger charge ce fichier en CommonJS ; il lance le serveur Astro, qui est un module ES.
 * Le serveur démarre de lui-même à l'import ; Passenger reprend la main sur son port.
 * Les réglages (clé Giphy, sel des votes…) viennent des variables d'environnement définies dans cPanel.
 */
import('./dist/server/entry.mjs').catch((error) => {
  console.error('[484] démarrage impossible :', error);
  process.exit(1);
});
