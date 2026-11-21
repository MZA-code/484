/**
 * Une team : un <button> entier, cliquable, avec l'étiquette « TEAM », le cadre du GIF,
 * l'origine, le nom en très grand et la réplique.
 */
import type { Team } from '../../engine';
import { formatText } from '../../lib/format';
import { GifFrame } from './GifFrame';
import type { DebateTeam } from './types';

interface Props {
  team: DebateTeam;
  side: Team;
  /** Clé du GIF (« rivalité/a ») ; voir gifs.ts. */
  gifKey: string;
  /** Image fixe au lieu de la vidéo (prefers-reduced-motion). */
  stillOnly: boolean;
  color: string;
  leaving: boolean;
  label: string;
  chooseLabel: string;
  onChoose: (team: Team) => void;
}

export function TeamCard({
  team,
  side,
  gifKey,
  stillOnly,
  color,
  leaving,
  label,
  chooseLabel,
  onChoose,
}: Props) {
  // Description lue après « Choisir team X » : origine et réplique, sans répéter le nom.
  const id = (part: string) => `team-${side}-${part}`;
  return (
    <button
      type="button"
      class={`team-card team-card--${side}${leaving ? ' is-leaving' : ''}`}
      style={{ '--card': color }}
      aria-label={formatText(chooseLabel, { name: team.name })}
      aria-describedby={`${id('origin')} ${id('line')}`}
      onClick={() => onChoose(side)}
    >
      <span class="team-tag" aria-hidden="true">
        {label}
      </span>
      <GifFrame gifKey={gifKey} name={team.name} stillOnly={stillOnly} />
      <span class="team-origin" id={id('origin')}>
        {team.origin}
      </span>
      <span class="team-name" aria-hidden="true">
        {team.name}
      </span>
      <span class="team-line" id={id('line')}>
        {team.line}
      </span>
    </button>
  );
}
