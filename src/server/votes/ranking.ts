/**
 * Classements du Hall of Fame, calculés à partir des compteurs bruts.
 * Logique pure, sans base de données.
 *
 * Pourquoi l'intervalle de Wilson : un prétendant à 1 victoire sur 1 (100 %) ne doit pas
 * passer devant un autre à 80 victoires sur 100. On classe sur la borne basse
 * (top) ou haute (flop) de l'intervalle de confiance à 95 % du taux de victoire.
 */

const Z = 1.96;

export interface ContenderCounts {
  id: string;
  wins: number;
  losses: number;
}

export interface PairCounts {
  aId: string;
  bId: string;
  aWins: number;
  bWins: number;
}

export interface RankedContender extends ContenderCounts {
  total: number;
  /** Taux de victoire arrondi, en %. */
  winRate: number;
}

export interface CloseDuel extends PairCounts {
  total: number;
}

/** Bornes de l'intervalle de Wilson (taux de victoire entre 0 et 1). */
export function wilson(wins: number, total: number): { low: number; high: number } {
  if (total <= 0) return { low: 0, high: 1 };
  const p = wins / total;
  const z2 = Z * Z;
  const center = p + z2 / (2 * total);
  const margin = Z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total);
  const denominator = 1 + z2 / total;
  return { low: (center - margin) / denominator, high: (center + margin) / denominator };
}

const ranked = (c: ContenderCounts): RankedContender => {
  const total = c.wins + c.losses;
  return { ...c, total, winRate: total ? Math.round((c.wins / total) * 100) : 0 };
};

export interface RankingOptions {
  top?: number;
  flop?: number;
  /** Votes minimum pour figurer parmi les mal-aimés (on ne juge pas sur un seul duel). */
  flopMinVotes?: number;
}

export function rankContenders(
  rows: readonly ContenderCounts[],
  { top = 20, flop = 5, flopMinVotes = 5 }: RankingOptions = {},
): { top: RankedContender[]; flop: RankedContender[] } {
  const voted = rows.filter((r) => r.wins + r.losses > 0).map(ranked);
  // Le top ne contient que des prétendants qui ont gagné au moins une fois.
  const byLow = voted
    .filter((r) => r.wins > 0)
    .map((r) => ({ r, score: wilson(r.wins, r.total).low }))
    .sort((a, b) => b.score - a.score || b.r.total - a.r.total || a.r.id.localeCompare(b.r.id))
    .slice(0, top)
    .map(({ r }) => r);

  const inTop = new Set(byLow.map((r) => r.id));
  const worst = voted
    .filter((r) => r.total >= flopMinVotes && !inTop.has(r.id))
    .map((r) => ({ r, score: wilson(r.wins, r.total).high }))
    .sort((a, b) => a.score - b.score || b.r.total - a.r.total || a.r.id.localeCompare(b.r.id))
    .slice(0, flop)
    .map(({ r }) => r);

  return { top: byLow, flop: worst };
}

/** Les duels les plus serrés : écart relatif le plus faible, à partir d'un nombre de votes minimum. */
export function closestDuels(
  pairs: readonly PairCounts[],
  { limit = 5, minVotes = 10 }: { limit?: number; minVotes?: number } = {},
): CloseDuel[] {
  return pairs
    .map((p) => ({ ...p, total: p.aWins + p.bWins }))
    .filter((p) => p.total >= minVotes)
    .sort(
      (x, y) =>
        Math.abs(x.aWins - x.bWins) / x.total - Math.abs(y.aWins - y.bWins) / y.total ||
        y.total - x.total ||
        `${x.aId}|${x.bId}`.localeCompare(`${y.aId}|${y.bId}`),
    )
    .slice(0, limit);
}
