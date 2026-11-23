/**
 * Choix de la remarque affichée après un vote, selon la part des visiteurs
 * qui ont fait le même choix.
 */
import { randomInt, type Rng } from './random';

export type QuipCategory = 'high' | 'mid' | 'low' | 'neutral';
export type QuipBook = Readonly<Record<QuipCategory, readonly string[]>>;

/** Nombre de votes minimum sur une paire avant d'afficher un pourcentage. */
export const MIN_VOTES_FOR_SHARE = 5;

/** Résultat d'une paire renvoyé par l'API : votes pour le choix du visiteur, et total. */
export interface PairResult {
  chosenVotes: number;
  totalVotes: number;
  /** Détail des quatre choix (team A, team B, aucun des deux, les deux), si l'API le donne. */
  split?: { a: number; b: number; none: number; both: number } | undefined;
}

export type ShareOutcome =
  | { kind: 'unavailable' } // l'API n'a pas répondu : pas de pourcentage
  | { kind: 'first' } // moins de 5 votes : texte « premier à trancher »
  | { kind: 'share'; percent: number };

export function shareOutcome(result: PairResult | null): ShareOutcome {
  if (!result || result.totalVotes <= 0)
    return result ? { kind: 'first' } : { kind: 'unavailable' };
  if (result.totalVotes < MIN_VOTES_FOR_SHARE) return { kind: 'first' };
  const percent = Math.round((result.chosenVotes / result.totalVotes) * 100);
  return { kind: 'share', percent: Math.min(100, Math.max(0, percent)) };
}

/** high si ≥ 60 %, mid entre 40 et 59 %, low sous 40 %, neutral sans pourcentage. */
export function quipCategory(outcome: ShareOutcome): QuipCategory {
  if (outcome.kind !== 'share') return 'neutral';
  if (outcome.percent >= 60) return 'high';
  if (outcome.percent >= 40) return 'mid';
  return 'low';
}

export interface Quip {
  text: string;
  /** Identifiant stable (« catégorie:index ») pour éviter de répéter la même remarque. */
  key: string;
}

/** Tire une remarque de la catégorie, jamais la même que `lastKey` si on a le choix. */
export function pickQuip(
  book: QuipBook,
  category: QuipCategory,
  lastKey: string | null,
  rng: Rng,
): Quip {
  const list = book[category];
  if (list.length === 0) throw new Error(`No quip in category: ${category}`);
  const candidates = list
    .map((text, index) => ({ text, key: `${category}:${index}` }))
    .filter((quip) => list.length === 1 || quip.key !== lastKey);
  return candidates[randomInt(candidates.length, rng)] as Quip;
}
