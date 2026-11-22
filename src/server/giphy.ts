/**
 * Service Giphy côté serveur. La clé API ne quitte jamais le serveur :
 * le client ne reçoit que les URL des médias légers (MP4 / WebP).
 *
 * Ordre de priorité pour une team :
 * 1. un des GIF choisis à la main (`giphyIds`), au hasard ;
 * 2. sinon, un résultat de la recherche `giphyQuery` (`lang=fr`, `rating=g`) validé :
 *    d'abord ceux qui contiennent un mot-clé entier (nom de la team, requête, `giphyKeywords`),
 *    puis, sans `giphyKeywords`, ceux qui contiennent un mot significatif de la requête
 *    (voir gif-match.ts). Un GIF trop signalé (« Mauvais GIF ? ») est remplacé par le suivant ;
 * 3. sinon, le GIF d'ambiance de la catégorie (ses `giphyIds`, ou sa recherche `giphyQuery`) :
 *    un GIF générique (« difficult choice » pour les dilemmes), jamais présenté comme la team ;
 * 4. sinon, null : le navigateur garde le cadre rayé avec le nom.
 * Un résultat de recherche de team non validé n'est jamais renvoyé.
 *
 * Tout est mis en cache (mémoire + fichier) pour ménager le quota de l'API.
 */
import { keywordsFor, matchesKeywords, queryWords } from './gif-match';

const API = 'https://api.giphy.com/v1/gifs';

/** Ce que l'API du site renvoie au navigateur. */
export interface Gif {
  id: string;
  /**
   * Vidéo MP4 légère (rendu « fixed_height » de Giphy, 200 px de haut). Vide pour une image
   * rangée sur le site (voir teamImage) : le navigateur affiche alors `webp` en image.
   */
  mp4: string;
  /** Même rendu en WebP animé, en secours. */
  webp: string;
  /** Image fixe : affichée quand l'utilisateur préfère réduire les animations. */
  still: string;
  width: number;
  height: number;
  /** Version réduite (100 px de haut), pour les vignettes de l'accueil. */
  small?: { mp4: string; webp: string; still: string };
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
    fixed_height_small?: GiphyRendition;
    fixed_height_small_still?: GiphyRendition;
  };
}

/** Extrait les rendus légers d'un objet Giphy ; null si l'un manque. */
export function toGif(raw: GiphyObject | undefined): Gif | null {
  const video = raw?.images?.fixed_height;
  const still = raw?.images?.fixed_height_still;
  if (!raw?.id || !video?.mp4 || !video.webp || !still?.url) return null;
  const gif: Gif = {
    id: raw.id,
    mp4: video.mp4,
    webp: video.webp,
    still: still.url,
    width: Number(video.width) || 0,
    height: Number(video.height) || 0,
  };
  const small = raw.images?.fixed_height_small;
  const smallStill = raw.images?.fixed_height_small_still;
  if (small?.mp4 && small.webp && smallStill?.url) {
    gif.small = { mp4: small.mp4, webp: small.webp, still: smallStill.url };
  }
  return gif;
}

/** Version légère d'un GIF (vignette) : le petit rendu s'il existe, sinon le rendu normal. */
export function thumbnailOf(gif: Gif): Pick<Gif, 'id' | 'mp4' | 'webp' | 'still'> {
  return { id: gif.id, ...(gif.small ?? { mp4: gif.mp4, webp: gif.webp, still: gif.still }) };
}

export interface GifSource {
  /** Nom de la team : mot-clé par défaut (voir `keywordsFor`). */
  name: string;
  giphyIds: readonly string[];
  giphyQuery: string;
  giphyKeywords?: readonly string[] | undefined;
  /** GIF d'ambiance de la catégorie, en dernier recours. */
  fallback?: CategoryGifs | undefined;
}

/** GIF d'ambiance d'une catégorie : choisis à la main, sinon une recherche générique. */
export interface CategoryGifs {
  giphyIds?: readonly string[] | undefined;
  giphyQuery: string;
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

/** Index stable (0 ≤ i < n) tiré d'un texte : même team, même choix. */
export function stableIndex(text: string, n: number): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return n > 0 ? hash % n : 0;
}

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

  async function searchRaw(query: string): Promise<GiphyObject[]> {
    const body = (await call('/search', {
      q: query,
      limit: String(SEARCH_LIMIT),
      rating: 'g',
      lang: 'fr',
    })) as { data?: GiphyObject[] };
    return body.data ?? [];
  }

  /**
   * Les résultats validés de la recherche, les plus sûrs d'abord : mot-clé entier (`keywords`),
   * puis mot significatif de la requête (`words`, vide pour ne pas l'utiliser).
   */
  function candidates(query: string, keywords: readonly string[], words: readonly string[]) {
    // Les mots-clés font partie de la clé : les changer relance une recherche.
    const sorted = (list: readonly string[]) => [...list].sort().join(',').toLowerCase();
    const q = query.trim().toLowerCase();
    // Résultats des versions précédentes (correspondances exactes seulement : liste `s:`, ou GIF
    // unique `q:`) : encore valables s'ils ne sont pas vides. Les réutiliser évite de refaire
    // 2 000 recherches au déploiement, avec une clé Giphy limitée à 100 appels par heure.
    const previous = cache.get(`s:${q}|k:${sorted(keywords)}`);
    if (Array.isArray(previous) && previous.length > 0) return Promise.resolve(previous);
    const single = cache.get(`q:${q}|k:${sorted(keywords)}`);
    if (single && !Array.isArray(single)) return Promise.resolve([single as Gif]);
    const key = `c:${q}|k:${sorted(keywords)}|w:${sorted(words)}`;
    return cached<readonly Gif[]>(
      key,
      (list) => (list.length > 0 ? TTL.search : TTL.empty),
      async () => {
        const results = await searchRaw(query);
        const strict = results.filter((raw) => matchesKeywords(raw, keywords));
        const loose = results.filter((raw) => !strict.includes(raw) && matchesKeywords(raw, words));
        return [...strict, ...loose]
          .map((raw) => toGif(raw))
          .filter((gif) => gif !== null)
          .slice(0, MAX_CANDIDATES);
      },
    );
  }

  /** GIF d'ambiance d'une catégorie (recherche générique choisie par nous : premiers résultats). */
  function moodGifs(query: string) {
    return cached<readonly Gif[]>(
      `m:${query.trim().toLowerCase()}`,
      (list) => (list.length > 0 ? TTL.search : TTL.empty),
      async () =>
        (await searchRaw(query))
          .map((raw) => toGif(raw))
          .filter((gif) => gif !== null)
          .slice(0, MAX_CANDIDATES),
    );
  }

  const pick = <T>(list: readonly T[]): T | undefined => list[Math.floor(random() * list.length)];

  return {
    /** GIF d'ambiance d'une catégorie (vignette de l'accueil) : choisi à la main, sinon le premier trouvé. */
    async categoryGif(mood: CategoryGifs): Promise<Gif | null> {
      const curated = pick(mood.giphyIds ?? []);
      if (curated) {
        const gif = await byId(curated);
        if (gif) return gif;
      }
      return (await moodGifs(mood.giphyQuery))[0] ?? null;
    },

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
      const curated = pick(source.giphyIds);
      if (curated) {
        const gif = await byId(curated);
        if (gif) return gif;
      }
      // Avec des mots-clés écrits à la main, eux seuls valident : pas de validation mot à mot.
      const words = source.giphyKeywords?.length ? [] : queryWords(source.giphyQuery);
      const list = await candidates(source.giphyQuery, keywordsFor(source), words);
      const found = list.find((gif) => !rejected.has(gif.id));
      if (found) return found;

      const fallback = source.fallback;
      if (!fallback) return null;
      const mood = pick(fallback.giphyIds ?? []);
      if (mood) {
        const gif = await byId(mood);
        if (gif) return gif;
      }
      // Toujours le même GIF d'ambiance pour une team donnée, mais pas le même pour toutes.
      const moods = (await moodGifs(fallback.giphyQuery)).filter((gif) => !rejected.has(gif.id));
      return moods[stableIndex(source.name, moods.length)] ?? null;
    },
  };
}

export type GiphyService = ReturnType<typeof createGiphyService>;
