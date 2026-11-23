/**
 * Clé Giphy du site, transmise au navigateur dans les plans de /api/gif et /api/category-gif :
 * c'est le navigateur qui appelle Giphy (règle de GIPHY pour le web, voir src/lib/giphy.ts).
 */
import { rmSync } from 'node:fs';
import { getSecret } from 'astro:env/server';

let oldCacheRemoved = false;

/**
 * Mode développement sans Giphy (`npm run dev:sans-giphy`) : la clé n'est jamais envoyée au
 * navigateur, donc aucun appel à l'API Giphy ; les cartes reçoivent un GIF de remplacement.
 * Jamais activé en production (la variable n'existe pas dans cPanel).
 */
export function giphyOffline(): boolean {
  return getSecret('GIPHY_OFFLINE') === 'true';
}

/** undefined si la clé Giphy n'est pas configurée, ou en mode sans Giphy. */
export function getGiphyKey(): string | undefined {
  if (giphyOffline()) return undefined;
  // Les versions avant 1.5.0 gardaient les réponses de Giphy dans un fichier : GIPHY l'interdit.
  if (!oldCacheRemoved) {
    oldCacheRemoved = true;
    try {
      rmSync('data/gif-cache.json', { force: true });
    } catch {
      // Fichier absent ou protégé : rien d'autre à faire.
    }
  }
  return getSecret('GIPHY_API_KEY') || undefined;
}

export const gifJson = (body: unknown, status: number, cacheControl: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });
