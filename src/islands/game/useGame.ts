/**
 * Contrôleur de l'îlot : relie le moteur pur à Preact, au stockage local et à l'URL.
 * Toute la logique de jeu reste dans `src/engine/` ; ici, seulement l'orchestration.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  changeTheme,
  defaultRng,
  loadState,
  nextQuip,
  resolveStorage,
  saveState,
  shareOutcome,
  skipDuel,
  vote,
  type GameContext,
  type GameState,
  type ShareOutcome,
  type Side,
} from '../../engine';
import { catalogFrom, initialState, themeFromSearch } from './init';
import type { GameData } from './types';

/** Durée de sortie du perdant avant l'entrée du challenger (total < 300 ms avec l'entrée). */
export const EXIT_MS = 120;

export interface VoteResult {
  /** Change à chaque vote : sert de clé pour rejouer l'animation « pop ». */
  id: number;
  winnerId: string;
  outcome: ShareOutcome;
  quip: string;
}

export type Notice =
  { kind: 'milestone'; count: number } | { kind: 'retired'; contenderId: string; streak: number };

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useGame(data: GameData) {
  const ctx = useMemo<GameContext>(
    () => ({
      catalog: catalogFrom(data),
      rng: defaultRng,
      milestones: Object.keys(data.texts.milestones).map(Number),
    }),
    [data],
  );
  const storage = useMemo(() => resolveStorage(() => window.localStorage), []);

  const [state, setState] = useState<GameState>(() =>
    initialState(
      ctx,
      themeFromSearch(window.location.search, ctx.catalog),
      loadState(storage, ctx),
    ),
  );
  const [result, setResult] = useState<VoteResult | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leaving, setLeaving] = useState<Side[]>([]);

  // Références à jour pour les gestionnaires d'événements (clavier, minuteries).
  const stateRef = useRef(state);
  stateRef.current = state;
  const busy = useRef(false);

  // Sauvegarde locale à chaque changement (silencieuse si le stockage est indisponible).
  useEffect(() => {
    saveState(storage, state);
  }, [storage, state]);

  // L'URL suit le thème courant, sans recharger la page ni empiler l'historique.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('theme') !== state.theme) {
      url.searchParams.set('theme', state.theme);
      window.history.replaceState(null, '', url);
    }
  }, [state.theme]);

  /** Applique un nouvel état, avec la courte sortie des cartes remplacées. */
  const commit = useCallback((next: GameState) => {
    const current = stateRef.current;
    const replaced: Side[] = [];
    if (next.left !== current.left) replaced.push('left');
    if (next.right !== current.right) replaced.push('right');

    if (replaced.length === 0 || prefersReducedMotion()) {
      setState(next);
      return;
    }
    busy.current = true;
    setLeaving(replaced);
    window.setTimeout(() => {
      setLeaving([]);
      setState(next);
      busy.current = false;
    }, EXIT_MS);
  }, []);

  const choose = useCallback(
    (side: Side) => {
      if (busy.current) return;
      const current = stateRef.current;
      const transition = vote(current, side, ctx);
      const voted = transition.events.find((e) => e.type === 'voted');
      if (!voted) return;

      // Phase 2 : pas encore d'API de votes, donc pas de pourcentage (remarque neutre).
      const outcome = shareOutcome(null);
      const quip = nextQuip(transition.state, data.texts.quips, outcome, ctx.rng);

      setResult({ id: quip.state.duelCount, winnerId: voted.winnerId, outcome, quip: quip.text });
      setNotices(
        transition.events.flatMap((e): Notice[] => {
          if (e.type === 'milestone') return [{ kind: 'milestone', count: e.count }];
          if (e.type === 'retired') {
            return [{ kind: 'retired', contenderId: e.contenderId, streak: e.streak }];
          }
          return [];
        }),
      );
      commit(quip.state);
    },
    [ctx, data, commit],
  );

  const skip = useCallback(() => {
    if (busy.current) return;
    setResult(null);
    setNotices([]);
    commit(skipDuel(stateRef.current, ctx));
  }, [ctx, commit]);

  const selectTheme = useCallback(
    (theme: string) => {
      if (busy.current || theme === stateRef.current.theme) return;
      setResult(null);
      setNotices([]);
      commit(changeTheme(stateRef.current, theme, ctx));
    },
    [ctx, commit],
  );

  return { state, ctx, result, notices, leaving, choose, skip, selectTheme };
}
