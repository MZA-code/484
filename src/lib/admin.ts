/**
 * Mode admin de l'éditeur, sans compte : le jeton GIF_REPORT_TOKEN gardé dans le navigateur.
 *
 * Activation, une fois par appareil : ouvrir https://team484.fr/#admin=<jeton>.
 * Désactivation : https://team484.fr/#admin=off. Le jeton est dans le fragment (#) de l'adresse :
 * il n'est jamais envoyé au serveur dans l'URL ni écrit dans ses journaux. Le script du gabarit
 * (BaseLayout) le range dans le stockage local et l'efface de la barre d'adresse.
 */
export const ADMIN_STORAGE_KEY = '484:admin';
/** Même nom que côté serveur (src/server/votes/runtime.ts). */
export const ADMIN_HEADER = 'x-484-admin';

/** Jeton du mode admin, ou null. */
export function adminToken(): string | null {
  try {
    return window.localStorage.getItem(ADMIN_STORAGE_KEY);
  } catch {
    return null;
  }
}
