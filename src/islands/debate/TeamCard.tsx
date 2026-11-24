/**
 * Une team : un <button> entier, cliquable, avec l'étiquette « TEAM », le cadre du GIF,
 * l'origine, le nom en très grand et la réplique.
 *
 * Le bouton tire son nom de son propre texte (critère WCAG 2.5.3 : le nom accessible contient
 * le texte visible). Le nom suit l'étiquette dans le code, pour être lu « Team Edward, Twilight… » ;
 * le CSS (order) le replace sous l'origine à l'écran.
 */
import type { Choice, Team } from '../../engine';
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
  /** Choix fait sur ce duel, qui reste affiché tranché jusqu'au suivant (null avant le vote). */
  decided: Choice | null;
  /** Sortie en cours (vers le duel suivant), ou null. */
  exit: Exit;
  label: string;
  onChoose: (team: Team) => void;
}

/**
 * Classes d'état : la team choisie « gagne » (soulevée), l'autre s'efface à moitié
 * et le reste tant que le duel tranché est affiché ; à la sortie, elle disparaît. Un passage
 * fait tout disparaître.
 */
function stateClass(decided: Choice | null, exit: Exit, side: Team): string {
  if (exit === 'skip') return ' is-leaving';
  if (!decided) return '';
  const out = exit ? ' is-out' : '';
  // « Aucun des deux » : les deux cartes tombent ; « les deux » : les deux gagnent.
  if (decided === 'none') return ` is-rejected${out}`;
  if (decided === 'both') return ' is-chosen';
  return decided === side ? ' is-chosen' : ` is-rejected${out}`;
}

export function TeamCard(props: Props) {
  const { team, side, gifKey, stillOnly, color, decided, exit, label, onChoose } = props;
  return (
    <button
      type="button"
      class={`team-card team-card--${side}${stateClass(decided, exit, side)}`}
      style={{ '--card': color }}
      onClick={() => onChoose(side)}
    >
      <span class="team-tag">{label}</span> <span class="team-name">{team.name}</span>{' '}
      <GifFrame gifKey={gifKey} name={team.name} stillOnly={stillOnly} />
      <span class="team-origin">{team.origin}</span> <span class="team-line">{team.line}</span>
    </button>
  );
}
