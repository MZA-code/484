/**
 * Chargement et préchargement des GIF côté navigateur.
 *
 * Le site dit quoi afficher (/api/gif-plans renvoie des plans) ; pour Giphy, c'est le navigateur
 * qui appelle l'API directement et affiche les adresses telles quelles (règles de GIPHY, voir
 * src/lib/giphy.ts). Pour qu'un duel s'enchaîne sans attente, la vidéo du prochain challenger
 * est préchargée par un lecteur caché : le navigateur la garde dans son cache HTTP habituel.
 * En cas d'échec à n'importe quelle étape, on renvoie null : la carte garde son cadre sans GIF,
 * et le jeu continue.
 *
 * Quota (D45) : la clé beta de GIPHY permet 100 appels par heure pour tout le site. Les plans
 * des prochains duels sont donc demandés au site par lots (prefetchDuels), et tous les GIF
 * choisis à la main d'un lot partent vers Giphy en un seul appel. Seules les recherches (teams
 * sans GIF choisi) coûtent un appel chacune, et seulement pour le duel affiché et le suivant.
 */
import { useEffect, useState } from 'preact/hooks';
import { giphyClientFor, type TeamGifPlan } from '../../lib/giphy';

/** Plans par requête au site (24 duels ; le site en accepte 60). */
const PLANS_PER_REQUEST = 48;
/** Duels à venir préparés d'un coup, et seuil sous lequel on prépare le lot suivant. */
const AHEAD_BATCH = 24;
const AHEAD_MIN = 6;

/** Plan de chaque team, demandé une fois par visite. */
const plans = new Map<string, Promise<TeamGifPlan | null>>();
let waitingPlans: Map<
  string,
  { resolve: (plan: TeamGifPlan | null) => void; reject: () => void }
> | null = null;

/** Plan d'une team ; les demandes faites d'un coup partent au site en une seule requête. */
function planOf(gifKey: string): Promise<TeamGifPlan | null> {
  const known = plans.get(gifKey);
  if (known) return known;
  const promise = new Promise<TeamGifPlan | null>((resolve, reject) => {
    if (!waitingPlans) {
      waitingPlans = new Map();
      setTimeout(() => void flushPlans(), 0);
    }
    waitingPlans.set(gifKey, { resolve, reject });
  });
  plans.set(gifKey, promise);
  // Site injoignable : on pourra redemander plus tard.
  promise.catch(() => {
    if (plans.get(gifKey) === promise) plans.delete(gifKey);
  });
  return promise;
}

async function flushPlans(): Promise<void> {
  const batch = waitingPlans;
  waitingPlans = null;
  if (!batch) return;
  const keys = [...batch.keys()];
  for (let i = 0; i < keys.length; i += PLANS_PER_REQUEST) {
    const chunk = keys.slice(i, i + PLANS_PER_REQUEST);
    try {
      const response = await fetch(`/api/gif-plans?teams=${encodeURIComponent(chunk.join(','))}`);
      if (!response.ok) throw new Error(`gif-plans ${response.status}`);
      const body = (await response.json()) as { plans?: Record<string, TeamGifPlan | null> };
      chunk.forEach((key) => batch.get(key)?.resolve(body.plans?.[key] ?? null));
    } catch {
      chunk.forEach((key) => batch.get(key)?.reject());
    }
  }
}

const duelKeys = (rivalryId: string) => [teamGifKey(rivalryId, 'a'), teamGifKey(rivalryId, 'b')];

/**
 * Prépare les prochains duels (le premier est celui affiché) : quand il en reste moins de
 * AHEAD_MIN de prêts, les plans des AHEAD_BATCH suivants sont demandés au site en une requête,
 * puis leurs GIF choisis à la main à Giphy en un seul appel. Rien n'est affiché.
 */
export function prefetchDuels(rivalryIds: readonly string[]): void {
  const ready = rivalryIds
    .slice(0, AHEAD_MIN)
    .every((id) => duelKeys(id).every((k) => plans.has(k)));
  if (ready) return;
  const keys = rivalryIds
    .slice(0, AHEAD_BATCH)
    .flatMap(duelKeys)
    .filter((k) => !plans.has(k));
  void Promise.all(keys.map((k) => planOf(k).catch(() => null))).then((list) => {
    const idsByKey = new Map<string, string[]>();
    for (const plan of list) {
      if (plan?.kind !== 'giphy' || !plan.id) continue;
      idsByKey.set(plan.key, [...(idsByKey.get(plan.key) ?? []), plan.id]);
    }
    idsByKey.forEach((ids, key) => giphyClientFor(key).prefetch(ids));
  });
}

export interface GifInfo {
  id: string;
  mp4: string;
  webp: string;
  still: string;
}

/** GIF choisi pour chaque team pendant cette visite (la même carte ne change pas de GIF). */
const infos = new Map<string, Promise<GifInfo | null>>();

/** Lecteurs cachés qui préchargent les prochaines vidéos (les plus anciens sont libérés). */
const MAX_PRELOADED = 6;
const preloaded = new Map<string, HTMLVideoElement>();

/** Clé du GIF d'une team : « rivalité/a » ou « rivalité/b ». */
export function teamGifKey(rivalryId: string, team: 'a' | 'b'): string {
  return `${rivalryId}/${team}`;
}

async function resolve(plan: TeamGifPlan | null): Promise<GifInfo | null> {
  if (!plan) return null;
  if (plan.kind === 'gif') return plan.gif;
  return giphyClientFor(plan.key).teamGif(plan);
}

/**
 * GIF d'une team, choisi une seule fois par visite. « Rien trouvé » est gardé (redemander
 * coûterait un appel pour rien) ; un échec (site injoignable, Giphy en erreur) ne l'est pas.
 */
function gifInfo(gifKey: string): Promise<GifInfo | null> {
  let pending = infos.get(gifKey);
  if (!pending) {
    const attempt = planOf(gifKey).then(resolve);
    pending = attempt.catch(() => null);
    infos.set(gifKey, pending);
    attempt.catch(() => {
      if (infos.get(gifKey) === pending) infos.delete(gifKey);
    });
  }
  return pending;
}

/** Précharge une vidéo avec un lecteur caché, à son adresse d'origine. */
function preloadVideo(src: string): void {
  if (preloaded.has(src)) return;
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';
  video.src = src;
  preloaded.set(src, video);
  for (const [key, old] of preloaded) {
    if (preloaded.size <= MAX_PRELOADED) break;
    preloaded.delete(key);
    old.removeAttribute('src');
    old.load();
  }
}

/** Télécharge à l'avance le GIF d'un prétendant (sans rien afficher). */
export function preloadGif(gifKey: string, stillOnly: boolean): void {
  void gifInfo(gifKey).then((info) => {
    if (!info) return;
    if (stillOnly || !info.mp4) new Image().src = stillOnly ? info.still : info.webp;
    else preloadVideo(info.mp4);
  });
}

export type GifMedia = { kind: 'video'; src: string } | { kind: 'image'; src: string };

export interface GifState {
  media: GifMedia | null;
  /**
   * Vrai une fois la réponse reçue. `settled` sans `media` : pas de GIF (aucun résultat,
   * ou Giphy indisponible, quota atteint compris) ; il n'y a rien à attendre.
   */
  settled: boolean;
}

/** Média à afficher pour un prétendant : vidéo, ou image fixe si les animations sont réduites. */
export function useGif(gifKey: string, stillOnly: boolean): GifState {
  const [state, setState] = useState<GifState>({ media: null, settled: false });
  useEffect(() => {
    let cancelled = false;
    setState({ media: null, settled: false });
    void gifInfo(gifKey).then((info) => {
      if (cancelled) return;
      if (!info) {
        setState({ media: null, settled: true });
        return;
      }
      // Image fixe : animations réduites, ou image rangée sur le site (pas de vidéo).
      if (stillOnly || !info.mp4) {
        const src = stillOnly ? info.still : info.webp;
        setState({ media: { kind: 'image', src }, settled: true });
        return;
      }
      setState({ media: { kind: 'video', src: info.mp4 }, settled: true });
    });
    return () => {
      cancelled = true;
    };
  }, [gifKey, stillOnly]);
  return state;
}
