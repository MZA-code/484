/**
 * Contrôleur de l'îlot : relie le moteur pur à Preact, au stockage local, à l'URL et à l'API.
 *
 * L'état du moteur est mis à jour tout de suite (un pourcentage qui arrive pendant
 * l'animation ne peut pas être écrasé). Seule la rivalité affichée reste en place
 * pendant la courte sortie des cartes, puis la suivante entre.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  changeCategory,
  debateQuip,
  DEBATE_STORAGE_KEY,
  defaultRng,
  readJson,
  recordOutcome,
  removeKey,
  resolveStorage,
  restoreDebate,
  shareOutcome,
  skip as skipRivalry,
  vote,
  writeJson,
  type DebateContext,
  type DebateState,
  type ShareOutcome,
  type Team,
} from '../../engine';
import { catalogFrom, categoryFromSearch, initialDebate } from './init';
import type { DebateData } from './types';
import { sendVote } from './votes';

/** Durée de sortie des cartes avant l'entrée de la rivalité suivante (< 300 ms avec l'entrée). */
export const EXIT_MS = 120;
/** Clé de l'ancien mode « duels », nettoyée au passage. */
const LEGACY_STORAGE_KEY = '484:game';

export interface VoteResult {
  /** Change à chaque vote : sert de clé pour rejouer l'animation « pop ». */
  id: number;
  rivalryId: string;
  team: Team;
  /** null tant que l'API n'a pas répondu (au plus 1,5 s). */
  outcome: ShareOutcome | null;
  quip: string | null;
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useDebate(data: DebateData) {
  const ctx = useMemo<DebateContext>(
    () => ({
      catalog: catalogFrom(data),
      rng: defaultRng,
      milestones: Object.keys(data.texts.milestones).map(Number),
    }),
    [data],
  );
  const storage = useMemo(() => resolveStorage(() => window.localStorage), []);

  const [state, setState] = useState<DebateState>(() => {
    removeKey(storage, LEGACY_STORAGE_KEY);
    return initialDebate(
      ctx,
      categoryFromSearch(window.location.search, ctx.catalog),
      restoreDebate(readJson(storage, DEBATE_STORAGE_KEY), ctx),
    );
  });
  /** Rivalité affichée : en retard de 120 ms sur le moteur pendant l'animation de sortie. */
  const [shown, setShown] = useState(state.current);
  const [leaving, setLeaving] = useState(false);
  const [result, setResult] = useState<VoteResult | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const busy = useRef(false);
  /** Vote dont le bandeau attend le résultat ; une réponse plus ancienne n'y touche pas. */
  const pendingVote = useRef(-1);

  useEffect(() => {
    writeJson(storage, DEBATE_STORAGE_KEY, state);
  }, [storage, state]);

  // L'URL suit la catégorie, sans recharger la page ni empiler l'historique.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('theme') !== state.category) {
      url.searchParams.set('theme', state.category);
      window.history.replaceState(null, '', url);
    }
  }, [state.category]);

  /** Applique un nouvel état et fait entrer sa rivalité (après la sortie de l'ancienne). */
  const advance = useCallback((next: DebateState) => {
    setState(next);
    if (prefersReducedMotion()) {
      setShown(next.current);
      return;
    }
    busy.current = true;
    setLeaving(true);
    window.setTimeout(() => {
      setShown(next.current);
      setLeaving(false);
      busy.current = false;
    }, EXIT_MS);
  }, []);

  const choose = useCallback(
    (team: Team) => {
      if (busy.current) return;
      const current = stateRef.current;
      const rivalryId = current.current;
      const transition = vote(current, team, ctx);
      const id = transition.state.count;
      pendingVote.current = id;

      setResult({ id, rivalryId, team, outcome: null, quip: null });
      const reached = transition.events.find((e) => e.type === 'milestone');
      setMilestone(reached?.type === 'milestone' ? reached.count : null);
      advance(transition.state);

      void sendVote({ rivalryId, team, category: current.category }).then((pair) => {
        const outcome = shareOutcome(pair);
        // Le profil compte toujours ce vote, même si un autre a eu lieu depuis.
        if (pendingVote.current !== id) {
          setState((s) => recordOutcome(s, rivalryId, outcome));
          return;
        }
        const quip = debateQuip(stateRef.current, data.texts.quips, outcome, ctx.rng);
        setState((s) => ({
          ...recordOutcome(s, rivalryId, outcome),
          lastQuipKey: quip.state.lastQuipKey,
        }));
        setResult((r) => (r && r.id === id ? { ...r, outcome, quip: quip.text } : r));
      });
    },
    [ctx, data, advance],
  );

  const skip = useCallback(() => {
    if (busy.current) return;
    pendingVote.current = -1;
    setResult(null);
    setMilestone(null);
    advance(skipRivalry(stateRef.current, ctx));
  }, [ctx, advance]);

  const selectCategory = useCallback(
    (category: string) => {
      if (busy.current || category === stateRef.current.category) return;
      pendingVote.current = -1;
      setResult(null);
      setMilestone(null);
      advance(changeCategory(stateRef.current, category, ctx));
    },
    [ctx, advance],
  );

  return { state, ctx, shown, leaving, result, milestone, choose, skip, selectCategory };
}
