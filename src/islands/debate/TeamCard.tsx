/**
 * Une team : un <button> entier, cliquable, avec l'étiquette « TEAM », le cadre du GIF,
 * l'origine, le nom en très grand et la réplique.
 */
import type { Team } from '../../engine';
import { formatText } from '../../lib/format';
import type { DebateTeam } from './types';

interface Props {
  team: DebateTeam;
  side: Team;
  color: string;
  leaving: boolean;
  label: string;
  chooseLabel: string;
  onChoose: (team: Team) => void;
}

export function TeamCard({ team, side, color, leaving, label, chooseLabel, onChoose }: Props) {
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
      {/* Cadre du GIF : rayé, avec le nom, en attendant les GIF des teams (phase 3 du pivot). */}
      <span class="team-media" aria-hidden="true">
        <span class="team-media-name">{team.name}</span>
      </span>
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
