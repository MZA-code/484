/**
 * Catalogue : la liste des prétendants par thème, telle que le moteur la voit
 * (uniquement des identifiants, aucun texte).
 */

export const MIXED_THEME = 'mix';

export interface Catalog {
  /** Thèmes jouables, « Tout mélangé » compris, dans l'ordre d'affichage. */
  readonly themeIds: readonly string[];
  /** Identifiants des prétendants pour chaque thème ; « mix » est l'union de tous. */
  readonly pools: ReadonlyMap<string, readonly string[]>;
}

export function createCatalog(
  themeIds: readonly string[],
  contenders: readonly { id: string; theme: string }[],
): Catalog {
  const pools = new Map<string, string[]>(themeIds.map((id) => [id, []]));
  for (const contender of contenders) {
    pools.get(contender.theme)?.push(contender.id);
  }
  pools.set(
    MIXED_THEME,
    contenders.map((c) => c.id),
  );
  return { themeIds: [MIXED_THEME, ...themeIds], pools };
}

export function isKnownTheme(catalog: Catalog, theme: string): boolean {
  return catalog.pools.has(theme);
}

export function poolFor(catalog: Catalog, theme: string): readonly string[] {
  const pool = catalog.pools.get(theme);
  if (!pool) throw new Error(`Unknown theme: ${theme}`);
  return pool;
}
