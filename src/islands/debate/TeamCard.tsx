/**
 * Une team : un <button> entier, cliquable, avec l'étiquette « TEAM », le cadre du GIF,
 * l'origine, le nom en très grand et la réplique.
 *
 * Le bouton tire son nom de son propre texte (critère WCAG 2.5.3 : le nom accessible contient
 * le texte visible). Le nom suit l'étiquette dans le code, pour être lu « Team Edward, Twilight… » ;
 * le CSS (order) le replace sous l'origine à l'écran.
 */
import type { Team } from '../../engine';
import type { Exit } from './useDebate';
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
  /** Sortie en cours : cette team a gagné, a perdu, ou on passe la rivalité. */
  exit: Exit;
  label: string;
  onChoose: (team: Team) => void;
}

/** Classe de sortie : la team choisie « gagne », l'autre tombe ; un passage fait tout disparaître. */
function exitClass(exit: Exit, side: Team): string {
  if (!exit) return '';
  if (exit === 'skip') return ' is-leaving';
  // « Aucun des deux » : les deux cartes tombent ; « les deux » : les deux gagnent.
  if (exit === 'none') return ' is-rejected';
  if (exit === 'both') return ' is-chosen';
  return exit === side ? ' is-chosen' : ' is-rejected';
}

export function TeamCard({ team, side, gifKey, stillOnly, color, exit, label, onChoose }: Props) {
  return (
    <button
      type="button"
      class={`team-card team-card--${side}${exitClass(exit, side)}`}
      style={{ '--card': color }}
      onClick={() => onChoose(side)}
    >
      <span class="team-tag">{label}</span> <span class="team-name">{team.name}</span>{' '}
      <GifFrame gifKey={gifKey} name={team.name} stillOnly={stillOnly} />
      <span class="team-origin">{team.origin}</span> <span class="team-line">{team.line}</span>
    </button>
  );
}
