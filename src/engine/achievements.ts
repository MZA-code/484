/**
 * Achievements : des objectifs à débloquer en jouant, calculés à partir de l'état du jeu.
 *
 * Rien n'est stocké en plus : un achievement est débloqué dès que sa valeur atteint son objectif,
 * et toutes les valeurs ne font que monter (débats, rebelles, catégories, meilleure série).
 * Tout se passe dans le navigateur : aucun compte, aucune donnée envoyée.
 */
import type { DebateCatalog, DebateState } from './debate';

export const ACHIEVEMENT_KINDS = [
  'debates',
  'rebels',
  'categories',
  'universes',
  'streak',
] as const;
export type AchievementKind = (typeof ACHIEVEMENT_KINDS)[number];

/** Ce que le moteur a besoin de savoir d'un achievement (le reste est du texte). */
export interface AchievementRule {
  id: string;
  kind: AchievementKind;
  goal: number;
}

/** Valeur actuelle d'un type d'achievement. */
export function achievementValue(
  state: DebateState,
  kind: AchievementKind,
  catalog: DebateCatalog,
): number {
  switch (kind) {
    case 'debates':
      return state.count;
    case 'rebels':
      return state.rebels;
    case 'streak':
      return state.bestStreak;
    case 'categories':
      return state.categories.length;
    case 'universes':
      return catalog.universes.filter((u) => u.categories.some((c) => state.categories.includes(c)))
        .length;
  }
}

export interface AchievementProgress<R extends AchievementRule> {
  rule: R;
  /** Valeur atteinte, plafonnée à l'objectif. */
  value: number;
  done: boolean;
}

export function achievementProgress<R extends AchievementRule>(
  state: DebateState,
  rules: readonly R[],
  catalog: DebateCatalog,
): AchievementProgress<R>[] {
  return rules.map((rule) => {
    const value = Math.min(achievementValue(state, rule.kind, catalog), rule.goal);
    return { rule, value, done: value >= rule.goal };
  });
}

/** Identifiants des achievements débloqués. */
export function unlockedIds(
  state: DebateState,
  rules: readonly AchievementRule[],
  catalog: DebateCatalog,
): Set<string> {
  return new Set(
    achievementProgress(state, rules, catalog)
      .filter((p) => p.done)
      .map((p) => p.rule.id),
  );
}

/**
 * Le prochain achievement à viser : celui qui est le plus avancé (en proportion) ;
 * à égalité, le plus proche en valeur absolue. null quand tout est débloqué.
 */
export function nextAchievement<R extends AchievementRule>(
  progress: readonly AchievementProgress<R>[],
): AchievementProgress<R> | null {
  const remaining = progress.filter((p) => !p.done);
  if (remaining.length === 0) return null;
  return remaining.reduce((best, p) => {
    const ratio = p.value / p.rule.goal;
    const bestRatio = best.value / best.rule.goal;
    if (ratio !== bestRatio) return ratio > bestRatio ? p : best;
    return p.rule.goal - p.value < best.rule.goal - best.value ? p : best;
  });
}
