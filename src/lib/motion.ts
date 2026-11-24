/**
 * Préférence d'animations. Par défaut, animations et GIF sont activés ; l'interrupteur
 * « Animations » de l'en-tête permet de les couper, choix gardé dans le stockage local
 * (voir motion-pref.ts).
 *
 * La préférence est posée sur <html data-motion="full|reduced"> dès le chargement
 * (script en ligne du gabarit), pour que le CSS et les îlots la lisent tout de suite.
 */
import { useEffect, useState } from 'preact/hooks';
import { MOTION_EVENT, prefersReducedMotion, REDUCED_MOTION_QUERY } from './motion-pref';

export { MOTION_EVENT, MOTION_STORAGE_KEY, prefersReducedMotion } from './motion-pref';

/** Suit la préférence, qu'elle change dans le système ou par l'interrupteur du site. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const update = () => setReduced(prefersReducedMotion());
    const list = window.matchMedia?.(REDUCED_MOTION_QUERY);
    list?.addEventListener('change', update);
    window.addEventListener(MOTION_EVENT, update);
    return () => {
      list?.removeEventListener('change', update);
      window.removeEventListener(MOTION_EVENT, update);
    };
  }, []);
  return reduced;
}
