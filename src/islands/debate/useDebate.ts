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
  unlockedIds,
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
import { prefersReducedMotion } from '../../lib/motion';
import { catalogFrom, categoryFromSearch, initialDebate } from './init';
import type { DebateData } from './types';
import { sendVote } from './votes';

/** Durée de sortie des cartes avant l'entrée de la rivalité suivante (< 300 ms avec l'entrée). */
export const EXIT_MS = 130;

/** Comment la rivalité affichée s'en va : une team choisie (elle gagne, l'autre tombe) ou un passage. */
export type Exit = Team | 'skip' | null;
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

/** Un achievement tel que décrit dans les textes du site. */
export type Achievement = DebateData['texts']['achievements']['list'][number];

export function useDebate(data: DebateData, initialRivalry?: string) {
  const ctx = useMemo<DebateContext>(
    () => ({ catalog: catalogFrom(data), rng: defaultRng }),
    [data],
  );
  const rules = data.texts.achievements.list;
  const storage = useMemo(() => resolveStorage(() => window.localStorage), []);

  const [state, setState] = useState<DebateState>(() => {
    removeKey(storage, LEGACY_STORAGE_KEY);
    return initialDebate(
      ctx,
      categoryFromSearch(window.location.search, ctx.catalog),
      restoreDebate(readJson(storage, DEBATE_STORAGE_KEY), ctx),
      initialRivalry ?? null,
    );
  });
  /** Rivalité affichée : en retard de 120 ms sur le moteur pendant l'animation de sortie. */
  const [shown, setShown] = useState(state.current);
  const [exit, setExit] = useState<Exit>(null);
  const [result, setResult] = useState<VoteResult | null>(null);
  /** Achievement qui vient d'être débloqué (bandeau), ou null. */
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  /** Achievements déjà débloqués : null avant le premier rendu (ceux d'avant ne s'annoncent pas). */
  const unlocked = useRef<Set<string> | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const busy = useRef(false);
  /** Vote dont le bandeau attend le résultat ; une réponse plus ancienne n'y touche pas. */
  const pendingVote = useRef(-1);

  useEffect(() => {
    writeJson(storage, DEBATE_STORAGE_KEY, state);
  }, [storage, state]);

  // Achievements : on compare avec ceux déjà débloqués, à chaque changement d'état. Les
  // déblocages qui dépendent du pourcentage (rebelle, série) arrivent avec la réponse de l'API.
  useEffect(() => {
    const now = unlockedIds(state, rules, ctx.catalog);
    const before = unlocked.current;
    unlocked.current = now;
    if (!before) return;
    const fresh = rules.filter((rule) => now.has(rule.id) && !before.has(rule.id));
    const last = fresh.at(-1);
    if (last) setAchievement(last);
  }, [state, rules, ctx]);

  // L'adresse suit le débat affiché (/debat/<id>?theme=<catégorie>) : la copier suffit pour le partager.
  // replaceState : on ne remplit pas l'historique, le bouton « retour » quitte le jeu.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.pathname = `/debat/${shown}`;
    url.searchParams.set('theme', state.category);
    if (url.href !== window.location.href) window.history.replaceState(null, '', url);
  }, [shown, state.category]);

  /** Applique un nouvel état et fait entrer sa rivalité (après la sortie de l'ancienne). */
  const advance = useCallback((next: DebateState, how: Exclude<Exit, null>) => {
    setState(next);
    if (prefersReducedMotion()) {
      setShown(next.current);
      return;
    }
    busy.current = true;
    setExit(how);
    window.setTimeout(() => {
      setShown(next.current);
      setExit(null);
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
      setAchievement(null);
      advance(transition.state, team);

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
    setAchievement(null);
    advance(skipRivalry(stateRef.current, ctx), 'skip');
  }, [ctx, advance]);

  const selectCategory = useCallback(
    (category: string) => {
      if (busy.current || category === stateRef.current.category) return;
      pendingVote.current = -1;
      setResult(null);
      setAchievement(null);
      advance(changeCategory(stateRef.current, category, ctx), 'skip');
    },
    [ctx, advance],
  );

  return { state, ctx, shown, exit, result, achievement, choose, skip, selectCategory };
}
