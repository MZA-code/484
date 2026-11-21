/**
 * Classements du Hall of Fame des débats, calculés à partir des compteurs bruts.
 * Logique pure, sans base de données.
 */

export interface RivalryCounts {
  id: string;
  aVotes: number;
  bVotes: number;
}

export interface RankedRivalry extends RivalryCounts {
  total: number;
  /** Part de la team A, arrondie, en % (la team B a le reste). */
  aPercent: number;
}

/** Votes minimum pour juger qu'un débat est serré ou écrasant (pas sur trois votes). */
export const MIN_VOTES_TO_RANK = 10;

const ranked = (r: RivalryCounts): RankedRivalry => {
  const total = r.aVotes + r.bVotes;
  return { ...r, total, aPercent: total ? Math.round((r.aVotes / total) * 100) : 50 };
};

/** Écart relatif entre les deux teams : 0 = égalité parfaite, 1 = unanimité. */
const margin = (r: RankedRivalry) => Math.abs(r.aVotes - r.bVotes) / r.total;

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
  const judged = all.filter((r) => r.total >= minVotes);
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
