/** Démarrage de l'îlot de débat : logique pure, testée sans navigateur. */
import {
  changeCategory,
  createDebate,
  createDebateCatalog,
  MIXED_CATEGORY,
  type DebateCatalog,
  type DebateContext,
  type DebateState,
} from '../../engine';

export function catalogFrom(data: {
  categories: readonly { id: string }[];
  rivalries: readonly { id: string; category: string }[];
}): DebateCatalog {
  return createDebateCatalog(
    data.categories.map((c) => c.id),
    data.rivalries,
  );
}

/** Lit `?theme=` dans l'URL (nom gardé du brief) ; null si absent ou inconnu. */
export function categoryFromSearch(search: string, catalog: DebateCatalog): string | null {
  const category = new URLSearchParams(search).get('theme');
  return category && catalog.pools.has(category) ? category : null;
}

/**
 * État de départ :
 * - une partie sauvegardée est reprise (compteur, historique, profil) ;
 * - la catégorie demandée dans l'URL l'emporte sur celle de la sauvegarde ;
 * - sinon, nouvelle partie en « Tout mélangé ».
 */
export function initialDebate(
  ctx: DebateContext,
  urlCategory: string | null,
  stored: DebateState | null,
): DebateState {
  if (stored) return urlCategory ? changeCategory(stored, urlCategory, ctx) : stored;
  return createDebate(ctx, urlCategory ?? MIXED_CATEGORY);
}
