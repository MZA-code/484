/**
 * Cadre 16:9 du GIF. Le cadre rayé avec le nom reste dessous : il se voit tant que
 * le GIF charge, et pour toujours si le GIF échoue.
 */
import { useState } from 'preact/hooks';
import { useGif } from './gifs';

interface Props {
  gifKey: string;
  name: string;
  stillOnly: boolean;
}

export function GifFrame({ gifKey, name, stillOnly }: Props) {
  const media = useGif(gifKey, stillOnly);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const cls = `team-gif${ready ? ' is-ready' : ''}`;

  return (
    <span class="team-media" aria-hidden="true">
      <span class="team-media-name">{name}</span>
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
