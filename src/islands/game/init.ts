/**
 * Démarrage de l'îlot de jeu : logique pure, testée sans navigateur.
 */
import {
  changeTheme,
  createCatalog,
  createGame,
  isKnownTheme,
  MIXED_THEME,
  type Catalog,
  type GameState,
} from '../../engine';

export function catalogFrom(data: {
  themes: readonly { id: string }[];
  contenders: readonly { id: string; theme: string }[];
}): Catalog {
  return createCatalog(
    data.themes.map((t) => t.id),
    data.contenders,
  );
}

/** Lit `?theme=` dans une URL ; renvoie null si absent ou inconnu. */
export function themeFromSearch(search: string, catalog: Catalog): string | null {
  const theme = new URLSearchParams(search).get('theme');
  return theme && isKnownTheme(catalog, theme) ? theme : null;
}

/**
 * État de départ :
 * - une partie sauvegardée est reprise (compteur, top 5, records) ;
 * - le thème demandé dans l'URL l'emporte sur le thème sauvegardé ;
 * - sinon, nouvelle partie en « Tout mélangé ».
 */
export function initialState(
  ctx: Parameters<typeof createGame>[0],
  urlTheme: string | null,
  stored: GameState | null,
): GameState {
  if (stored) return urlTheme ? changeTheme(stored, urlTheme, ctx) : stored;
  return createGame(ctx, urlTheme ?? MIXED_THEME);
}
