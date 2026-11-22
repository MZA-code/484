/**
 * Chargement et préchargement des GIF côté navigateur.
 *
 * Pour qu'un duel s'enchaîne sans attente, le MP4 du prochain challenger est téléchargé
 * à l'avance et gardé en mémoire (URL « blob: »). Les médias de Giphy autorisent CORS.
 * En cas d'échec à n'importe quelle étape, on renvoie null ou l'URL directe : la carte
 * garde alors son cadre rayé, et le jeu continue.
 */
import { useEffect, useState } from 'preact/hooks';

/** Abonnés au rafraîchissement d'un GIF (voir refreshGif). */
const refreshListeners = new Set<(gifKey: string) => void>();

export interface GifInfo {
  id: string;
  mp4: string;
  webp: string;
  still: string;
}

/** Nombre de vidéos gardées en mémoire (les deux à l'écran + celles préchargées). */
const MAX_BLOBS = 10;

const infos = new Map<string, Promise<GifInfo | null>>();
const blobs = new Map<string, Promise<string>>();
/** Vidéos affichées en ce moment : jamais évincées du cache. */
const inUse = new Map<string, number>();

function retain(mp4: string): void {
  inUse.set(mp4, (inUse.get(mp4) ?? 0) + 1);
}

function release(mp4: string): void {
  const count = (inUse.get(mp4) ?? 1) - 1;
  if (count > 0) inUse.set(mp4, count);
  else inUse.delete(mp4);
}

/** Clé du GIF d'une team : « rivalité/a » ou « rivalité/b ». */
export function teamGifKey(rivalryId: string, team: 'a' | 'b'): string {
  return `${rivalryId}/${team}`;
}

/** Métadonnées du GIF d'une team, demandées une seule fois par visite (`reload` : redemander). */
export function gifInfo(gifKey: string, reload = false): Promise<GifInfo | null> {
  let pending = reload ? undefined : infos.get(gifKey);
  if (!pending) {
    const url = `/api/gif/${gifKey.split('/').map(encodeURIComponent).join('/')}`;
    // `reload` contourne aussi le cache du navigateur (une heure) : le serveur a changé de GIF.
    pending = fetch(url, reload ? { cache: 'reload' } : undefined)
      .then((r) => (r.ok ? (r.json() as Promise<GifInfo>) : null))
      .catch(() => null);
    infos.set(gifKey, pending);
    // Un échec réseau ne doit pas être définitif : on pourra réessayer plus tard.
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

/** URL locale (blob:) de la vidéo, ou l'URL d'origine si le téléchargement échoue. */
function videoUrl(mp4: string): Promise<string> {
  const hit = blobs.get(mp4);
  if (hit) {
    // Rafraîchit la position dans l'ordre d'utilisation (LRU).
    blobs.delete(mp4);
    blobs.set(mp4, hit);
    return hit;
  }
  const pending = fetch(mp4)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((blob) => URL.createObjectURL(blob))
    .catch(() => mp4);
  blobs.set(mp4, pending);
  // Éviction des plus anciennes vidéos, sauf celles affichées.
  for (const [key, url] of blobs) {
    if (blobs.size <= MAX_BLOBS) break;
    if (inUse.has(key) || key === mp4) continue;
    blobs.delete(key);
    void url.then((u) => u.startsWith('blob:') && URL.revokeObjectURL(u));
  }
  return pending;
}

/** Télécharge à l'avance le GIF d'un prétendant (sans rien afficher). */
export function preloadGif(gifKey: string, stillOnly: boolean): void {
  void gifInfo(gifKey).then((info) => {
    if (!info) return;
    if (stillOnly || !info.mp4) new Image().src = stillOnly ? info.still : info.webp;
    else void videoUrl(info.mp4);
  });
}

export type GifMedia = { kind: 'video'; src: string } | { kind: 'image'; src: string };

export interface GifState {
  media: GifMedia | null;
  /**
   * Vrai une fois la réponse du site reçue. `settled` sans `media` : pas de GIF (aucun résultat,
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
    let retained: string | null = null;
    setState({ media: null, settled: false });
    void gifInfo(gifKey).then(async (info) => {
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
      retain(info.mp4);
      retained = info.mp4;
      const src = await videoUrl(info.mp4);
      if (!cancelled) setState({ media: { kind: 'video', src }, settled: true });
    });
    return () => {
      cancelled = true;
      if (retained) release(retained);
    };
  }, [gifKey, stillOnly, version]);
  return state;
}
