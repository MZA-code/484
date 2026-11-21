/**
 * Une carte de duel : un <button> entier, cliquable, avec le cadre du GIF,
 * l'origine, le nom en très grand et la réplique.
 */
import type { Side } from '../../engine';
import { colorFor } from '../../lib/color';
import { formatText } from '../../lib/format';
import type { GameContender } from './types';

interface Props {
  contender: GameContender;
  side: Side;
  /** Nom du thème affiché avant l'origine en mode « Tout mélangé ». */
  themePrefix: string | null;
  /** Texte du badge de série si cette carte est le tenant du titre. */
  badge: string | null;
  leaving: boolean;
  chooseLabel: string;
  onChoose: (side: Side) => void;
}

export function DuelCard({
  contender,
  side,
  themePrefix,
  badge,
  leaving,
  chooseLabel,
  onChoose,
}: Props) {
  // Description lue après « Choisir X » : origine, réplique et badge, sans répéter le nom.
  const id = (part: string) => `duel-${side}-${part}`;
  const describedBy = [id('origin'), id('line'), badge ? id('badge') : null]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      class={`duel-card duel-card--${side}${leaving ? ' is-leaving' : ''}`}
      style={{ '--card': colorFor(contender.id) }}
      aria-label={formatText(chooseLabel, { name: contender.name })}
      aria-describedby={describedBy}
      onClick={() => onChoose(side)}
    >
      {/* Cadre du GIF : rayé en attendant la phase 3 (Giphy). */}
      <span class="duel-media" aria-hidden="true">
        <span class="duel-media-name">{contender.name}</span>
      </span>
      <span class="duel-body">
        <span class="duel-origin" id={id('origin')}>
          {themePrefix && <span class="duel-theme">{themePrefix} · </span>}
          {contender.origin}
        </span>
        <span class="duel-name" aria-hidden="true">
          {contender.name}
        </span>
        <span class="duel-line" id={id('line')}>
          {contender.line}
        </span>
        {badge && (
          <span class="duel-badge pop" key={badge} id={id('badge')}>
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}
