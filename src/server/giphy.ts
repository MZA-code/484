/**
 * Service Giphy côté serveur. La clé API ne quitte jamais le serveur :
 * le client ne reçoit que les URL des médias légers (MP4 / WebP).
 *
 * Ordre de priorité pour une team :
 * 1. un des GIF choisis à la main (`giphyIds`), au hasard ;
 * 2. sinon, le premier résultat de la recherche `giphyQuery` (`lang=fr`, `rating=g`) qui passe
 *    la validation par mots-clés (voir gif-match.ts) et n'a pas été écarté par les visiteurs
 *    (« Mauvais GIF ? » trop souvent signalé : on passe automatiquement au suivant) ;
 * 3. sinon, null : le navigateur garde le cadre rayé avec le nom.
 * Un résultat de recherche non validé n'est jamais renvoyé.
 *
 * Tout est mis en cache (mémoire + fichier) pour ménager le quota de l'API.
 */
import { keywordsFor, matchesKeywords } from './gif-match';

const API = 'https://api.giphy.com/v1/gifs';

/** Ce que l'API du site renvoie au navigateur. */
export interface Gif {
  id: string;
  /** Vidéo MP4 légère (rendu « fixed_height » de Giphy, 200 px de haut). */
  mp4: string;
  /** Même rendu en WebP animé, en secours. */
  webp: string;
  /** Image fixe : affichée quand l'utilisateur préfère réduire les animations. */
  still: string;
  width: number;
  height: number;
}

/** Durées de cache. */
export const TTL = {
  curated: 30 * 24 * 3600_000,
  search: 7 * 24 * 3600_000,
  /** Recherche sans résultat : on retentera plus tard. */
  empty: 24 * 3600_000,
} as const;

/** Ce que le cache garde : un GIF, une liste de GIF candidats, ou « aucun GIF » (null). */
export type CachedGif = Gif | readonly Gif[] | null;

export interface GifCache {
  /** `undefined` = absent ; `null` = « aucun GIF » mis en cache. */
  get(key: string): CachedGif | undefined;
  set(key: string, value: CachedGif, ttlMs: number): void;
}

export class GiphyError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GiphyError';
  }
}

interface GiphyRendition {
  url?: string;
  mp4?: string;
  webp?: string;
  width?: string;
  height?: string;
}

interface GiphyObject {
  id: string;
  title?: string;
  slug?: string;
  username?: string;
  images?: {
    fixed_height?: GiphyRendition;
    fixed_height_still?: GiphyRendition;
  };
}

/** Extrait les rendus légers d'un objet Giphy ; null si l'un manque. */
export function toGif(raw: GiphyObject | undefined): Gif | null {
  const video = raw?.images?.fixed_height;
  const still = raw?.images?.fixed_height_still;
  if (!raw?.id || !video?.mp4 || !video.webp || !still?.url) return null;
  return {
    id: raw.id,
    mp4: video.mp4,
    webp: video.webp,
    still: still.url,
    width: Number(video.width) || 0,
    height: Number(video.height) || 0,
  };
}

export interface GifSource {
  /** Nom de la team : mot-clé par défaut (voir `keywordsFor`). */
  name: string;
  giphyIds: readonly string[];
  giphyQuery: string;
  giphyKeywords?: readonly string[] | undefined;
}

/** Résultats demandés par recherche : de quoi en trouver un qui passe la validation. */
export const SEARCH_LIMIT = 25;

/**
 * Candidats validés gardés en cache par recherche : si le premier est écarté par les
 * signalements, le suivant prend sa place sans nouvel appel à Giphy.
 */
export const MAX_CANDIDATES = 5;

export interface GiphyServiceOptions {
  apiKey: string;
  cache: GifCache;
  fetch?: typeof fetch;
  random?: () => number;
  now?: () => number;
}

/**
 * Disjoncteur : après un « quota dépassé » (429), on n'appelle plus Giphy pendant ce délai.
 * Les cartes gardent leur cadre rayé, sans attendre un refus à chaque GIF.
 */
export const QUOTA_PAUSE_MS = 15 * 60_000;

export function createGiphyService({
  apiKey,
  cache,
  fetch: doFetch = fetch,
  random = Math.random,
  now = Date.now,
}: GiphyServiceOptions) {
  let pausedUntil = 0;
  // Deux visiteurs qui demandent le même GIF en même temps : un seul appel à Giphy.
  const inFlight = new Map<string, Promise<CachedGif>>();

  async function call(path: string, params: Record<string, string>): Promise<unknown> {
    if (now() < pausedUntil) throw new GiphyError(429, 'Giphy quota exceeded (paused)');
    const url = new URL(`${API}${path}`);
    url.search = new URLSearchParams({ api_key: apiKey, ...params }).toString();
    const response = await doFetch(url, { headers: { accept: 'application/json' } });
    if (response.status === 429) pausedUntil = now() + QUOTA_PAUSE_MS;
    if (!response.ok) {
      // Le message ne contient jamais l'URL : elle porte la clé.
      throw new GiphyError(response.status, `Giphy responded ${response.status}`);
    }
    return response.json();
  }

  function cached<T extends CachedGif>(
    key: string,
    ttl: (value: T) => number,
    load: () => Promise<T>,
  ): Promise<T> {
    const hit = cache.get(key);
    if (hit !== undefined) return Promise.resolve(hit as T);
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<T>;
    const promise = load()
      .then((value) => {
        cache.set(key, value, ttl(value));
        return value;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  }

  function byId(id: string) {
    return cached<Gif | null>(
      `id:${id}`,
      (gif) => (gif ? TTL.curated : TTL.empty),
      async () => {
        const body = (await call(`/${encodeURIComponent(id)}`, {})) as { data?: GiphyObject };
        return toGif(body.data);
      },
    );
  }

  /** Les premiers résultats de la recherche qui passent la validation par mots-clés. */
  function candidates(query: string, keywords: readonly string[]) {
    // Les mots-clés font partie de la clé : les changer relance une recherche.
    const key = `s:${query.trim().toLowerCase()}|k:${[...keywords].sort().join(',').toLowerCase()}`;
    return cached<readonly Gif[]>(
      key,
      (list) => (list.length > 0 ? TTL.search : TTL.empty),
      async () => {
        const body = (await call('/search', {
          q: query,
          limit: String(SEARCH_LIMIT),
          rating: 'g',
          lang: 'fr',
        })) as { data?: GiphyObject[] };
        const list: Gif[] = [];
        for (const raw of body.data ?? []) {
          if (list.length >= MAX_CANDIDATES) break;
          if (!matchesKeywords(raw, keywords)) continue;
          const gif = toGif(raw);
          if (gif) list.push(gif);
        }
        return list;
      },
    );
  }

  return {
    /**
     * GIF d'une team : un des GIF choisis, sinon le premier résultat de recherche validé qui
     * n'est pas dans `rejected` (GIF trop signalés), sinon null.
     * Les GIF choisis à la main ne sont jamais écartés automatiquement : c'est à toi d'en juger
     * (ils apparaissent dans `npm run gif-audit`).
     */
    async gifFor(
      source: GifSource,
      rejected: ReadonlySet<string> = new Set(),
    ): Promise<Gif | null> {
      if (source.giphyIds.length > 0) {
        const id = source.giphyIds[Math.floor(random() * source.giphyIds.length)] as string;
        const gif = await byId(id);
        if (gif) return gif;
      }
      const list = await candidates(source.giphyQuery, keywordsFor(source));
      return list.find((gif) => !rejected.has(gif.id)) ?? null;
    },
  };
}

export type GiphyService = ReturnType<typeof createGiphyService>;
