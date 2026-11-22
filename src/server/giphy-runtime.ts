/**
 * Instance unique du service Giphy pour le serveur Astro, partagée par toutes les routes :
 * un seul cache en mémoire, un seul fichier `data/gif-cache.json`.
 */
import { getSecret } from 'astro:env/server';
import { createFileCache } from './gif-cache';
import { createGiphyService, type GiphyService } from './giphy';

let service: GiphyService | null = null;

/** null si la clé Giphy n'est pas configurée. */
export function getGiphyService(): GiphyService | null {
  const apiKey = getSecret('GIPHY_API_KEY');
  if (!apiKey) return null;
  service ??= createGiphyService({
    apiKey,
    cache: createFileCache(getSecret('GIF_CACHE_FILE') ?? 'data/gif-cache.json'),
  });
  return service;
}

export const gifJson = (body: unknown, status: number, cacheControl: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });
