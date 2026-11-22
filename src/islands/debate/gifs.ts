/**
 * Chargement et préchargement des GIF côté navigateur.
 *
 * Le site dit quoi afficher (/api/gif renvoie un plan) ; pour Giphy, c'est le navigateur qui
 * appelle l'API directement et affiche les adresses telles quelles (règles de GIPHY, voir
 * src/lib/giphy.ts). Pour qu'un duel s'enchaîne sans attente, la vidéo du prochain challenger
 * est préchargée par un lecteur caché : le navigateur la garde dans son cache HTTP habituel.
 * En cas d'échec à n'importe quelle étape, on renvoie null : la carte garde son cadre rayé,
 * et le jeu continue.
 */
import { useEffect, useState } from 'preact/hooks';
import { giphyClientFor, type TeamGifPlan } from '../../lib/giphy';

/** Abonnés au rafraîchissement d'un GIF (voir refreshGif). */
const refreshListeners = new Set<(gifKey: string) => void>();

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

/** GIF d'une team, choisi une seule fois par visite (`reload` : redemander au site). */
export function gifInfo(gifKey: string, reload = false): Promise<GifInfo | null> {
  let pending = reload ? undefined : infos.get(gifKey);
  if (!pending) {
    const url = `/api/gif/${gifKey.split('/').map(encodeURIComponent).join('/')}`;
    // `reload` contourne aussi le cache du navigateur (une heure) : le site a changé de GIF.
    pending = fetch(url, reload ? { cache: 'reload' } : undefined)
      .then((r) => (r.ok ? (r.json() as Promise<TeamGifPlan>) : null))
      .then(resolve)
      .catch(() => null);
    infos.set(gifKey, pending);
    // Un échec ne doit pas être définitif : on pourra réessayer plus tard.
    void pending.then((info) => {
      if (!info) infos.delete(gifKey);
    });
  }
  return pending;
}

/** Redemande le GIF d'une team (après un signalement en mode admin) et met à jour l'affichage. */
export function refreshGif(gifKey: string): void {
  void gifInfo(gifKey, true);
  refreshListeners.forEach((listener) => listener(gifKey));
}

/** Change à chaque rafraîchissement du GIF de cette team : à mettre dans les dépendances. */
export function useGifVersion(gifKey: string): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const listener = (key: string) => {
      if (key === gifKey) setVersion((v) => v + 1);
    };
    refreshListeners.add(listener);
    return () => {
      refreshListeners.delete(listener);
    };
  }, [gifKey]);
  return version;
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
  const version = useGifVersion(gifKey);
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
  }, [gifKey, stillOnly, version]);
  return state;
}
