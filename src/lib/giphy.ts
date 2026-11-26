/**
 * Giphy, appelé directement par le navigateur, comme GIPHY l'exige pour une application web :
 * pas de serveur intermédiaire, aucune réponse ni adresse de média gardée en cache, adresses
 * utilisées telles que Giphy les renvoie (voir docs/decisions.md, D32).
 *
 * Le serveur du site décide seulement *quoi* demander (un « plan », voir /api/gif-plans) : GIF choisi
 * à la main, recherche et mots-clés de validation, GIF écartés par les signalements, GIF
 * d'ambiance de la catégorie. Le navigateur fait les appels et applique la même règle :
 * 1. le GIF choisi à la main tiré au sort par le serveur ;
 * 2. sinon, un résultat de la recherche (`lang=fr`, `rating=g`) validé : d'abord ceux qui
 *    contiennent un mot-clé entier, puis ceux qui contiennent un mot significatif de la
 *    recherche (voir gif-match.ts), en sautant les GIF trop signalés ;
 * 3. sinon, le GIF d'ambiance de la catégorie (choisi à la main, ou recherche générique) ;
 * 4. sinon, null : la carte garde son cadre rayé avec le nom.
 */
import { matchesKeywords } from './gif-match';

const API = 'https://api.giphy.com/v1/gifs';

/** Un GIF, au format utilisé par les cartes. */
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

/** Ce qu'il faut demander à Giphy pour une team (préparé par /api/gif-plans). */
export interface TeamGiphyPlan {
  kind: 'giphy';
  /** Clé de l'API Giphy pour le web : publique par nature, elle part dans chaque appel. */
  key: string;
  /** Nom de la team : répartit les GIF d'ambiance entre les teams. */
  name: string;
  /** GIF choisi à la main, tiré au sort par le serveur : demandé en premier. */
  id?: string | undefined;
  query: string;
  /** Mots-clés entiers qui valident un résultat de recherche. */
  keywords: string[];
  /** Mots significatifs de la recherche (validation plus large) ; vide = pas de validation large. */
  words: string[];
  /** GIF d'ambiance de la catégorie, en dernier recours. */
  mood?: MoodPlan | undefined;
}

/** GIF d'ambiance d'une catégorie : un choisi à la main (tiré au sort), sinon une recherche. */
export interface MoodPlan {
  id?: string | undefined;
  query: string;
}

/** Plan d'une team (/api/gif-plans) : un GIF tout prêt (lien Tenor, image du site), ou quoi demander à Giphy. */
export type TeamGifPlan = { kind: 'gif'; gif: Gif } | TeamGiphyPlan;

/** Réponse de /api/finish-gif : quoi demander à Giphy pour l'écran de fin d'une catégorie. */
export interface CategoryGiphyPlan extends MoodPlan {
  kind: 'giphy';
  key: string;
}

/** Réponse de /api/category-gifs : quoi demander à Giphy pour toutes les vignettes de l'accueil. */
export interface CategoryGiphyPlans {
  kind: 'giphy';
  key: string;
  /** Par identifiant de catégorie. */
  plans: Record<string, MoodPlan>;
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

export interface GiphyObject {
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

/** Extrait les rendus légers d'un objet Giphy, adresses intactes ; null si l'un manque. */
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

/** Résultats demandés par recherche : de quoi en trouver un qui passe la validation. */
export const SEARCH_LIMIT = 25;

/** Candidats validés retenus par recherche (le premier est affiché) et GIF d’ambiance possibles. */
export const MAX_CANDIDATES = 5;

/**
 * Identifiants demandés en un seul appel au plus (`/v1/gifs?ids=…`). La clé beta de GIPHY permet
 * 100 appels par heure pour tout le site : un appel pour plusieurs GIF, et non un par GIF (D45).
 */
export const IDS_PER_CALL = 50;

/** Index stable (0 ≤ i < n) tiré d'un texte : même team, même choix. */
export function stableIndex(text: string, n: number): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return n > 0 ? hash % n : 0;
}

export interface GiphyClientOptions {
  apiKey: string;
  fetch?: (url: string) => Promise<Response>;
}

/**
 * Client Giphy d'une visite. Après un « quota dépassé » (429), il n'appelle plus Giphy jusqu'à
 * la fin de la visite : les cartes gardent leur cadre rayé sans attendre un refus à chaque GIF.
 */
export function createGiphyClient({
  apiKey,
  fetch: doFetch = (url) => fetch(url),
}: GiphyClientOptions) {
  let quotaExceeded = false;

  async function call(path: string, params: Record<string, string>): Promise<unknown> {
    if (quotaExceeded) throw new GiphyError(429, 'Giphy quota exceeded');
    const url = new URL(`${API}${path}`);
    url.search = new URLSearchParams({ api_key: apiKey, ...params }).toString();
    const response = await doFetch(url.toString());
    if (response.status === 429) quotaExceeded = true;
    if (!response.ok) {
      // Le message ne contient jamais l'URL : elle porte la clé.
      throw new GiphyError(response.status, `Giphy responded ${response.status}`);
    }
    return response.json();
  }

  /**
   * GIF demandés par identifiant pendant la visite : un même GIF n'est demandé qu'une fois, et
   * ceux demandés au même moment partent ensemble, en un seul appel (voir IDS_PER_CALL).
   * Rien n'est gardé au-delà de la visite (règle de GIPHY : pas de cache).
   */
  const gifsById = new Map<string, Promise<Gif | null>>();
  interface Waiter {
    resolve: (gif: Gif | null) => void;
    reject: (error: unknown) => void;
  }
  let waiting: Map<string, Waiter> | null = null;

  /** Un GIF par son identifiant ; null s'il a disparu de Giphy. */
  function byId(id: string): Promise<Gif | null> {
    const known = gifsById.get(id);
    if (known) return known;
    const promise = new Promise<Gif | null>((resolve, reject) => {
      if (!waiting) {
        waiting = new Map();
        // Le lot part au tour suivant : les demandes faites d'un coup partent ensemble.
        setTimeout(() => void flush(), 0);
      }
      waiting.set(id, { resolve, reject });
    });
    gifsById.set(id, promise);
    // Un échec (quota, réseau) n'est pas gardé : on pourra redemander plus tard.
    promise.catch(() => {
      if (gifsById.get(id) === promise) gifsById.delete(id);
    });
    return promise;
  }

  async function flush(): Promise<void> {
    const batch = waiting;
    waiting = null;
    if (!batch) return;
    const ids = [...batch.keys()];
    for (let i = 0; i < ids.length; i += IDS_PER_CALL) {
      const chunk = ids.slice(i, i + IDS_PER_CALL);
      try {
        const body = (await call('', { ids: chunk.join(',') })) as { data?: GiphyObject[] };
        const found = new Map((body.data ?? []).map((raw) => [raw.id, raw]));
        // Un identifiant absent de la réponse : GIF disparu de Giphy.
        chunk.forEach((id) => batch.get(id)?.resolve(toGif(found.get(id))));
      } catch (error) {
        const gone = error instanceof GiphyError && (error.status === 404 || error.status === 400);
        chunk.forEach((id) => {
          const waiter = batch.get(id);
          if (gone) waiter?.resolve(null);
          else waiter?.reject(error);
        });
      }
    }
  }

  async function search(query: string): Promise<GiphyObject[]> {
    const body = (await call('/search', {
      q: query,
      limit: String(SEARCH_LIMIT),
      rating: 'g',
      lang: 'fr',
    })) as { data?: GiphyObject[] };
    return body.data ?? [];
  }

  /** Les résultats validés, les plus sûrs d'abord : mot-clé entier, puis mot de la recherche. */
  async function candidates(plan: TeamGiphyPlan): Promise<Gif[]> {
    const results = await search(plan.query);
    const strict = results.filter((raw) => matchesKeywords(raw, plan.keywords));
    const loose = results.filter(
      (raw) => !strict.includes(raw) && matchesKeywords(raw, plan.words),
    );
    return [...strict, ...loose]
      .map((raw) => toGif(raw))
      .filter((gif) => gif !== null)
      .slice(0, MAX_CANDIDATES);
  }

  /** GIF d'ambiance (recherche générique choisie par nous : premiers résultats). */
  async function moodGifs(query: string): Promise<Gif[]> {
    return (await search(query))
      .map((raw) => toGif(raw))
      .filter((gif) => gif !== null)
      .slice(0, MAX_CANDIDATES);
  }

  return {
    /**
     * Demande d'avance des GIF choisis à la main (prochains duels, vignettes de l'accueil) : un
     * seul appel pour tout le lot ; les cartes les trouvent ensuite sans nouvel appel.
     */
    prefetch(ids: readonly string[]): void {
      if (quotaExceeded) return;
      ids.forEach((id) => void byId(id).catch(() => null));
    },

    /** Vrai après un « quota dépassé » : plus aucun appel pendant cette visite. */
    get quotaExceeded() {
      return quotaExceeded;
    },

    /** GIF d'une team : le choisi à la main, sinon le meilleur résultat validé, sinon l'ambiance. */
    async teamGif(plan: TeamGiphyPlan): Promise<Gif | null> {
      if (plan.id) {
        const gif = await byId(plan.id);
        if (gif) return gif;
      }
      const [found] = await candidates(plan);
      if (found) return found;

      const mood = plan.mood;
      if (!mood) return null;
      if (mood.id) {
        const gif = await byId(mood.id);
        if (gif) return gif;
      }
      // Toujours le même GIF d'ambiance pour une team donnée, mais pas le même pour toutes.
      const moods = await moodGifs(mood.query);
      return moods[stableIndex(plan.name, moods.length)] ?? null;
    },

    /** GIF d'ambiance d'une catégorie (vignette de l'accueil) : choisi à la main, sinon le premier trouvé. */
    async categoryGif(plan: MoodPlan): Promise<Gif | null> {
      if (plan.id) {
        const gif = await byId(plan.id);
        if (gif) return gif;
      }
      return (await moodGifs(plan.query))[0] ?? null;
    },
  };
}

export type GiphyClient = ReturnType<typeof createGiphyClient>;

/** Un client par clé, partagé par toute la page (un seul « quota dépassé » pour la visite). */
const clients = new Map<string, GiphyClient>();

export function giphyClientFor(apiKey: string): GiphyClient {
  let client = clients.get(apiKey);
  if (!client) {
    client = createGiphyClient({ apiKey });
    clients.set(apiKey, client);
  }
  return client;
}
