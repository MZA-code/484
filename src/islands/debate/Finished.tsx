/**
 * Écran de fin d'une catégorie : tous ses débats ont été tranchés ou passés, rien ne revient
 * tout seul. Une célébration (tampon « terminée », gerbes de confettis, GIF propre à la
 * catégorie, phrase drôle), puis des catégories où il reste à trancher et « Rejouer ».
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { CARD_COLORS } from '../../lib/color';
import { formatText, plural } from '../../lib/format';
import { giphyClientFor, type CategoryGiphyPlan, type Gif } from '../../lib/giphy';
import type { DebateData } from './types';

export interface Suggestion {
  id: string;
  label: string;
  remaining: number;
}

interface Props {
  /** Identifiant de la catégorie terminée (catégorie, univers ou « mix »). */
  id: string;
  /** Nom de la catégorie terminée ; null pour « Tout mélangé » (tout le site est tranché). */
  category: string | null;
  /** Phrase propre à la catégorie, sinon le texte générique. */
  line: string | undefined;
  /** Nombre de débats de la catégorie (« 50/50 »). */
  total: number;
  suggestions: Suggestion[];
  texts: DebateData['texts']['debate']['finished'];
  reducedMotion: boolean;
  onSelect: (category: string) => void;
  onReplay: () => void;
}

type FinishPlan = CategoryGiphyPlan | { kind: 'gif'; gif: Gif };

/** GIF de l'écran de fin : demandé au site, puis à Giphy par le navigateur. null : pas de GIF. */
function useFinishGif(id: string): Gif | null {
  const [gif, setGif] = useState<Gif | null>(null);
  useEffect(() => {
    let cancelled = false;
    setGif(null);
    fetch(`/api/finish-gif/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? (r.json() as Promise<FinishPlan>) : null))
      .then((plan) => {
        if (!plan) return null;
        return plan.kind === 'gif' ? plan.gif : giphyClientFor(plan.key).categoryGif(plan);
      })
      .then((found) => !cancelled && setGif(found))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [id]);
  return gif;
}

/** Trois gerbes de confettis (gauche, droite, centre), aux couleurs des cartes. Décoratif. */
function Fireworks() {
  const waves = [
    { x: '18%', y: '40%', delay: 120 },
    { x: '82%', y: '35%', delay: 380 },
    { x: '50%', y: '55%', delay: 0 },
  ];
  return (
    <span class="finish-fireworks" aria-hidden="true">
      {waves.map((wave, w) => (
        <span key={w} class="finish-burst" style={{ left: wave.x, top: wave.y }}>
          {Array.from({ length: 26 }, (_, i) => {
            const angle = (i / 26) * Math.PI * 2 + w;
            const distance = 110 + ((i * 53 + w * 31) % 150);
            const style = {
              '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
              '--dy': `${Math.round(Math.sin(angle) * distance * 0.8 - 60)}px`,
              '--rot': `${(i * 67 + w * 40) % 360}deg`,
              '--delay': `${wave.delay + (i % 6) * 30}ms`,
              background: CARD_COLORS[(i + w * 3) % CARD_COLORS.length],
            };
            return <span key={i} class={i % 3 === 0 ? 'is-round' : undefined} style={style} />;
          })}
        </span>
      ))}
    </span>
  );
}

export function Finished(props: Props) {
  const { id, category, line, total, suggestions, texts, reducedMotion } = props;
  const title = useRef<HTMLHeadingElement>(null);
  const gif = useFinishGif(id);
  /** GIF affiché une fois chargé (par identifiant : une image en cache peut charger tout de suite). */
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const gifReady = gif !== null && loadedId === gif.id;
  // Le débat voté a disparu : on place le focus sur le titre pour que la suite reste lisible
  // au clavier et au lecteur d'écran.
  useEffect(() => title.current?.focus(), []);

  const all = category === null;
  const body = all ? texts.allBody : (line ?? formatText(texts.body, { category }));
  const showVideo = gif && gif.mp4 && !reducedMotion;
  const still = gif && (reducedMotion ? gif.still : gif.webp);

  return (
    <section class="finish" aria-labelledby="finish-title">
      <div class="finish-hero">
        <span class="finish-rays" aria-hidden="true" />
        {!reducedMotion && <Fireworks />}
        <p class="finish-kicker">{all ? texts.allKicker : category}</p>
        <h1 class="finish-title" id="finish-title" tabIndex={-1} ref={title}>
          {all ? texts.allTitle : texts.title}
        </h1>
        <p class="finish-score">
          <span class="finish-score-value">{formatText(texts.score, { n: total })}</span>
          <span class="finish-score-label">{texts.scoreLabel}</span>
        </p>
      </div>

      <div class="finish-body">
        <div class={`finish-gif${gifReady ? ' is-ready' : ''}`} aria-hidden="true">
          <span class="finish-gif-wait">{texts.gifWait}</span>
          {showVideo ? (
            <video
              src={gif.mp4}
              autoplay
              muted
              loop
              playsInline
              disablePictureInPicture
              onLoadedData={() => setLoadedId(gif.id)}
            />
          ) : (
            still && (
              <img src={still} alt="" decoding="async" onLoad={() => gif && setLoadedId(gif.id)} />
            )
          )}
        </div>
        <div class="finish-text">
          <p class="finish-line">{body}</p>
          <div class="finish-replay">
            <button type="button" class="finish-replay-button" onClick={props.onReplay}>
              {all ? texts.replayAll : texts.replay}
            </button>
            <p class="finish-hint">{texts.replayHint}</p>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div class="finish-next">
          <h2 class="finish-next-title">{texts.next}</h2>
          <ul class="finish-list">
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  class="finish-card"
                  style={{ '--card': CARD_COLORS[(i * 3 + 1) % CARD_COLORS.length] }}
                  onClick={() => props.onSelect(s.id)}
                >
                  <span class="finish-card-label">{s.label}</span>
                  <span class="finish-card-count">{plural(texts.remaining, s.remaining)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
