/**
 * Classements du Hall of Fame des débats, calculés à partir des compteurs bruts.
 * Logique pure, sans base de données.
 */

export interface RivalryCounts {
  id: string;
  aVotes: number;
  bVotes: number;
  /** « Aucun des deux ». */
  noneVotes: number;
}

export interface RankedRivalry extends RivalryCounts {
  /** Tous les votes, « aucun des deux » compris. */
  total: number;
  /** Parts arrondies en % du total : team A, « aucun des deux », et team B (le reste). */
  aPercent: number;
  nonePercent: number;
  bPercent: number;
}

/** Votes minimum pour juger qu'un débat est serré ou écrasant (pas sur trois votes). */
export const MIN_VOTES_TO_RANK = 10;

const ranked = (r: RivalryCounts): RankedRivalry => {
  const total = r.aVotes + r.bVotes + r.noneVotes;
  if (!total) return { ...r, total, aPercent: 50, nonePercent: 0, bPercent: 50 };
  const aPercent = Math.round((r.aVotes / total) * 100);
  const nonePercent = Math.round((r.noneVotes / total) * 100);
  return {
    ...r,
    total,
    aPercent,
    nonePercent,
    bPercent: Math.max(0, 100 - aPercent - nonePercent),
  };
};

/** Votes pour l'une des deux teams (sans « aucun des deux »). */
const sided = (r: RivalryCounts) => r.aVotes + r.bVotes;

/**
 * Écart relatif entre les deux teams, parmi ceux qui ont choisi un camp :
 * 0 = égalité parfaite, 1 = unanimité. « Aucun des deux » ne rend pas un débat serré.
 */
const margin = (r: RankedRivalry) => Math.abs(r.aVotes - r.bVotes) / sided(r);

export interface Rankings {
  /** Les débats les plus serrés : écart le plus faible. */
  closest: RankedRivalry[];
  /** Les plus écrasants : écart le plus fort. */
  landslides: RankedRivalry[];
  /** Les plus votés. */
  popular: RankedRivalry[];
}

export function rankRivalries(
  rows: readonly RivalryCounts[],
  { limit = 5, popularLimit = 10, minVotes = MIN_VOTES_TO_RANK } = {},
): Rankings {
  const all = rows.map(ranked).filter((r) => r.total > 0);
  // Serré ou écrasant : jugé sur les votes pour l'une des deux teams.
  const judged = all.filter((r) => sided(r) >= minVotes);
  const byId = (a: RankedRivalry, b: RankedRivalry) => a.id.localeCompare(b.id);

  const closest = [...judged]
    .sort((a, b) => margin(a) - margin(b) || b.total - a.total || byId(a, b))
    .slice(0, limit);
  // Un débat ne peut pas être à la fois parmi les plus serrés et les plus écrasants.
  const inClosest = new Set(closest.map((r) => r.id));
  const landslides = judged
    .filter((r) => !inClosest.has(r.id))
    .sort((a, b) => margin(b) - margin(a) || b.total - a.total || byId(a, b))
    .slice(0, limit);
  const popular = [...all].sort((a, b) => b.total - a.total || byId(a, b)).slice(0, popularLimit);

  return { closest, landslides, popular };
}
