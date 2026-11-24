/**
 * Préférence d'animations, sans dépendance : utilisable par les îlots Preact comme par les
 * petits scripts des pages statiques (accueil).
 *
 * Par défaut, animations et GIF sont activés (« full »), quel que soit le réglage du système :
 * les GIF sont le cœur du jeu. L'interrupteur « Animations » de l'en-tête permet de les couper
 * (choix gardé dans le stockage local). La préférence est posée sur
 * <html data-motion="full|reduced"> dès le chargement (script du gabarit) ; sans elle (cas
 * qui ne devrait pas arriver), on retombe sur le réglage du système.
 */

export const MOTION_STORAGE_KEY = '484:motion';
/** Événement émis sur `window` quand l'interrupteur change la préférence. */
export const MOTION_EVENT = '484:motionchange';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Vrai si les animations doivent être réduites, en tenant compte de l'interrupteur. */
export function prefersReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  const forced = document.documentElement.dataset['motion'];
  if (forced === 'full') return false;
  if (forced === 'reduced') return true;
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
