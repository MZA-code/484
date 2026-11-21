/**
 * Chargement et préchargement des GIF côté navigateur.
 *
 * Pour qu'un duel s'enchaîne sans attente, le MP4 du prochain challenger est téléchargé
 * à l'avance et gardé en mémoire (URL « blob: »). Les médias de Giphy autorisent CORS.
 * En cas d'échec à n'importe quelle étape, on renvoie null ou l'URL directe : la carte
 * garde alors son cadre rayé, et le jeu continue.
 */
import { useEffect, useState } from 'preact/hooks';

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

/** Métadonnées du GIF d'un prétendant, demandées une seule fois par visite. */
export function gifInfo(contenderId: string): Promise<GifInfo | null> {
  let pending = infos.get(contenderId);
  if (!pending) {
    pending = fetch(`/api/gif/${encodeURIComponent(contenderId)}`)
      .then((r) => (r.ok ? (r.json() as Promise<GifInfo>) : null))
      .catch(() => null);
    infos.set(contenderId, pending);
    // Un échec réseau ne doit pas être définitif : on pourra réessayer plus tard.
    void pending.then((info) => {
      if (!info) infos.delete(contenderId);
    });
  }
  return pending;
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
export function preloadGif(contenderId: string, stillOnly: boolean): void {
  void gifInfo(contenderId).then((info) => {
    if (!info) return;
    if (stillOnly) new Image().src = info.still;
    else void videoUrl(info.mp4);
  });
}

export type GifMedia = { kind: 'video'; src: string } | { kind: 'image'; src: string };

/** Média à afficher pour un prétendant : vidéo, ou image fixe si les animations sont réduites. */
export function useGif(contenderId: string, stillOnly: boolean): GifMedia | null {
  const [media, setMedia] = useState<GifMedia | null>(null);
  useEffect(() => {
    let cancelled = false;
    let retained: string | null = null;
    setMedia(null);
    void gifInfo(contenderId).then(async (info) => {
      if (!info || cancelled) return;
      if (stillOnly) {
        setMedia({ kind: 'image', src: info.still });
        return;
      }
      retain(info.mp4);
      retained = info.mp4;
      const src = await videoUrl(info.mp4);
      if (!cancelled) setMedia({ kind: 'video', src });
    });
    return () => {
      cancelled = true;
      if (retained) release(retained);
    };
  }, [contenderId, stillOnly]);
  return media;
}
