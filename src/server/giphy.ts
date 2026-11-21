/**
 * Service Giphy côté serveur. La clé API ne quitte jamais le serveur :
 * le client ne reçoit que les URL des médias légers (MP4 / WebP).
 *
 * - Prétendant avec des GIF choisis à la main (`giphyIds`) : on en prend un au hasard.
 * - Sinon : premier résultat de la recherche `giphyQuery`, `rating=g`.
 * - Tout est mis en cache (mémoire + fichier) pour ménager le quota de l'API.
 */

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

export interface GifCache {
  /** `undefined` = absent ; `null` = « aucun GIF » mis en cache. */
  get(key: string): Gif | null | undefined;
  set(key: string, value: Gif | null, ttlMs: number): void;
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
  giphyIds: readonly string[];
  giphyQuery: string;
}

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
  const inFlight = new Map<string, Promise<Gif | null>>();

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

  function cached(key: string, ttl: (gif: Gif | null) => number, load: () => Promise<Gif | null>) {
    const hit = cache.get(key);
    if (hit !== undefined) return Promise.resolve(hit);
    const pending = inFlight.get(key);
    if (pending) return pending;
    const promise = load()
      .then((gif) => {
        cache.set(key, gif, ttl(gif));
        return gif;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  }

  function byId(id: string) {
    return cached(
      `id:${id}`,
      (gif) => (gif ? TTL.curated : TTL.empty),
      async () => {
        const body = (await call(`/${encodeURIComponent(id)}`, {})) as { data?: GiphyObject };
        return toGif(body.data);
      },
    );
  }

  function search(query: string) {
    return cached(
      `q:${query.trim().toLowerCase()}`,
      (gif) => (gif ? TTL.search : TTL.empty),
      async () => {
        const body = (await call('/search', {
          q: query,
          limit: '1',
          rating: 'g',
          lang: 'en',
        })) as { data?: GiphyObject[] };
        return toGif(body.data?.[0]);
      },
    );
  }

  return {
    /** GIF d'un prétendant : un des GIF choisis, sinon le premier résultat de recherche. */
    async gifFor(source: GifSource): Promise<Gif | null> {
      if (source.giphyIds.length > 0) {
        const id = source.giphyIds[Math.floor(random() * source.giphyIds.length)] as string;
        const gif = await byId(id);
        if (gif) return gif;
      }
      return search(source.giphyQuery);
    },
  };
}

export type GiphyService = ReturnType<typeof createGiphyService>;
