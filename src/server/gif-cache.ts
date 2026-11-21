/**
 * Cache des GIF : en mémoire, avec sauvegarde dans un fichier JSON pour survivre
 * aux redémarrages du serveur (la clé Giphy gratuite est limitée à ~100 appels par heure).
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Gif, GifCache } from './giphy';

interface Entry {
  value: Gif | null;
  expires: number;
}

/** Au-delà, on oublie les entrées les plus anciennes. */
const MAX_ENTRIES = 5000;

/** Délai de regroupement des écritures sur disque. */
export const WRITE_DELAY_MS = 300;

export function createMemoryCache(now: () => number = Date.now) {
  const entries = new Map<string, Entry>();

  const cache: GifCache & { entries: Map<string, Entry> } = {
    entries,
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expires <= now()) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value, ttlMs) {
      entries.delete(key);
      entries.set(key, { value, expires: now() + ttlMs });
      while (entries.size > MAX_ENTRIES) {
        const oldest = entries.keys().next().value;
        if (oldest === undefined) break;
        entries.delete(oldest);
      }
    },
  };
  return cache;
}

/**
 * Cache mémoire chargé depuis `file` au démarrage, réécrit (au plus toutes les 2 s)
 * après chaque ajout. Une erreur de lecture ou d'écriture n'empêche jamais de servir.
 */
export function createFileCache(file: string, now: () => number = Date.now): GifCache {
  const memory = createMemoryCache(now);
  try {
    const saved = JSON.parse(readFileSync(file, 'utf8')) as Record<string, Entry>;
    for (const [key, entry] of Object.entries(saved)) {
      if (entry.expires > now()) memory.entries.set(key, entry);
    }
  } catch {
    // Pas encore de fichier, ou fichier illisible : on repart d'un cache vide.
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    try {
      mkdirSync(dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      writeFileSync(tmp, JSON.stringify(Object.fromEntries(memory.entries)));
      renameSync(tmp, file);
    } catch (error) {
      console.warn('[gif-cache] write failed:', (error as Error).message);
    }
  };

  // Arrêt propre du serveur (redémarrage de l'hébergeur, Ctrl+C) : on écrit ce qui reste.
  const flushPending = () => {
    if (timer) flush();
  };
  process.once('beforeExit', flushPending);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      flushPending();
      process.exit(0);
    });
  }

  return {
    get: memory.get,
    set(key, value, ttlMs) {
      memory.set(key, value, ttlMs);
      // Écriture groupée, mais rapide : un arrêt brutal ne perd qu'une fraction de seconde.
      timer ??= setTimeout(flush, WRITE_DELAY_MS);
    },
  };
}
