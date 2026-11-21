/**
 * Contrôleur de l'îlot : relie le moteur pur à Preact, au stockage local et à l'URL.
 * Toute la logique de jeu reste dans `src/engine/` ; ici, seulement l'orchestration.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  changeTheme,
  defaultRng,
  loadState,
  pickQuip,
  quipCategory,
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
import { sendVote } from './votes';

/** Durée de sortie du perdant avant l'entrée du challenger (total < 300 ms avec l'entrée). */
export const EXIT_MS = 120;

export interface VoteResult {
  /** Change à chaque vote : sert de clé pour rejouer l'animation « pop ». */
  id: number;
  winnerId: string;
  /** null tant que l'API n'a pas répondu (au plus 1,5 s). */
  outcome: ShareOutcome | null;
  quip: string | null;
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
  /** Dernière remarque affichée (pour ne pas la répéter), à jour même pendant une animation. */
  const lastQuip = useRef(state.lastQuipKey);
  /** Vote dont on attend le résultat ; une réponse plus ancienne est ignorée. */
  const pendingVote = useRef(-1);

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

    const apply = () => setState({ ...next, lastQuipKey: lastQuip.current });
    if (replaced.length === 0 || prefersReducedMotion()) {
      apply();
      return;
    }
    busy.current = true;
    setLeaving(replaced);
    window.setTimeout(() => {
      setLeaving([]);
      apply();
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

      // Le duel suivant s'affiche tout de suite ; le pourcentage arrive quand l'API répond.
      const id = transition.state.duelCount;
      pendingVote.current = id;
      setResult({ id, winnerId: voted.winnerId, outcome: null, quip: null });
      setNotices(
        transition.events.flatMap((e): Notice[] => {
          if (e.type === 'milestone') return [{ kind: 'milestone', count: e.count }];
          if (e.type === 'retired') {
            return [{ kind: 'retired', contenderId: e.contenderId, streak: e.streak }];
          }
          return [];
        }),
      );
      commit(transition.state);

      void sendVote({ winnerId: voted.winnerId, loserId: voted.loserId, theme: voted.theme }).then(
        (pair) => {
          if (pendingVote.current !== id) return; // un autre vote, un passage ou un changement de thème a eu lieu
          const outcome = shareOutcome(pair);
          const quip = pickQuip(data.texts.quips, quipCategory(outcome), lastQuip.current, ctx.rng);
          lastQuip.current = quip.key;
          setResult((r) => (r && r.id === id ? { ...r, outcome, quip: quip.text } : r));
          setState((s) => ({ ...s, lastQuipKey: quip.key }));
        },
      );
    },
    [ctx, data, commit],
  );

  const skip = useCallback(() => {
    if (busy.current) return;
    pendingVote.current = -1;
    setResult(null);
    setNotices([]);
    commit(skipDuel(stateRef.current, ctx));
  }, [ctx, commit]);

  const selectTheme = useCallback(
    (theme: string) => {
      if (busy.current || theme === stateRef.current.theme) return;
      pendingVote.current = -1;
      setResult(null);
      setNotices([]);
      commit(changeTheme(stateRef.current, theme, ctx));
    },
    [ctx, commit],
  );

  return { state, ctx, result, notices, leaving, choose, skip, selectTheme };
}
