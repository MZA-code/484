/**
 * Cadre 16:9 du GIF. Le cadre rayé avec le nom reste dessous : il se voit tant que le GIF
 * charge. S'il n'y a pas de GIF (clé Giphy beta à court de quota, D45), il devient un carton.
 *
 * Indicateur de chargement : seulement si l'attente dure (plus de LOADER_DELAY_MS) et qu'un GIF
 * est vraiment en route. Si le site répond « pas de GIF » (Giphy à court de quota, aucun
 * résultat), la réponse est immédiate : pas d'indicateur, on n'attend rien pour rien.
 */
import { useEffect, useState } from 'preact/hooks';
import { useGif } from './gifs';

/** En dessous, un GIF arrive assez vite pour qu'un indicateur ne fasse que clignoter. */
export const LOADER_DELAY_MS = 300;

interface Props {
  gifKey: string;
  name: string;
  stillOnly: boolean;
}

export function GifFrame({ gifKey, name, stillOnly }: Props) {
  const { media, settled } = useGif(gifKey, stillOnly);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const cls = `team-gif${ready ? ' is-ready' : ''}`;

  useEffect(() => {
    setReady(false);
    setFailed(false);
    setSlow(false);
    const timer = window.setTimeout(() => setSlow(true), LOADER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [gifKey, stillOnly]);

  // En attente : réponse du site pas encore reçue, ou GIF reçu mais pas encore affichable.
  const waiting = !ready && !failed && (!settled || media !== null);
  // Pas de GIF pour cette carte (quota Giphy atteint, rien trouvé, média en erreur) : le cadre
  // devient un carton, comme au cinéma muet, plutôt qu'un cadre rayé qui a l'air d'attendre.
  const empty = (settled && media === null) || failed;

  return (
    <span class={`team-media${empty ? ' is-empty' : ''}`} aria-hidden="true">
      <span class="team-media-name">{name}</span>
      {slow && waiting && (
        <span class="gif-loader">
          <span />
          <span />
          <span />
        </span>
      )}
      {media && !failed && media.kind === 'video' && (
        <video
          class={cls}
          src={media.src}
          autoplay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
      {media && !failed && media.kind === 'image' && (
        <img
          class={cls}
          src={media.src}
          alt=""
          decoding="async"
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
