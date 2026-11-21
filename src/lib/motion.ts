/**
 * Préférence d'animations. Par défaut, le site suit le réglage du système
 * (`prefers-reduced-motion`) ; l'interrupteur « Animations » de l'en-tête permet
 * de forcer les animations ou de les couper, choix gardé dans le stockage local.
 *
 * La préférence est posée sur <html data-motion="full|reduced"> dès le chargement
 * (script en ligne du gabarit), pour que le CSS et les îlots la lisent tout de suite.
 */
import { useEffect, useState } from 'preact/hooks';

export const MOTION_STORAGE_KEY = '484:motion';
/** Événement émis sur `window` quand l'interrupteur change la préférence. */
export const MOTION_EVENT = '484:motionchange';

const QUERY = '(prefers-reduced-motion: reduce)';

/** Vrai si les animations doivent être réduites, en tenant compte de l'interrupteur. */
export function prefersReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  const forced = document.documentElement.dataset['motion'];
  if (forced === 'full') return false;
  if (forced === 'reduced') return true;
  return typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;
}

/** Suit la préférence, qu'elle change dans le système ou par l'interrupteur du site. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const update = () => setReduced(prefersReducedMotion());
    const list = window.matchMedia?.(QUERY);
    list?.addEventListener('change', update);
    window.addEventListener(MOTION_EVENT, update);
    return () => {
      list?.removeEventListener('change', update);
      window.removeEventListener(MOTION_EVENT, update);
    };
  }, []);
  return reduced;
}
