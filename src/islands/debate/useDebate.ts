/**
 * Contrôleur de l'îlot : relie le moteur pur à Preact, au stockage local, à l'URL et à l'API.
 *
 * L'état du moteur est mis à jour tout de suite (un pourcentage qui arrive pendant
 * l'animation ne peut pas être écrasé). Seule la rivalité affichée reste en place :
 * après un vote, le duel tranché reste à l'écran avec son résultat, jusqu'à `next()`
 * (fin du décompte du bandeau, ou une touche) ; un passage, lui,
 * enchaîne tout de suite. La rivalité suivante entre après la courte sortie des cartes.
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
  replayCategory,
  resolveStorage,
  restoreDebate,
  shareOutcome,
  skip as skipRivalry,
  vote,
  writeJson,
  type DebateContext,
  type DebateState,
  type Choice,
  type ShareOutcome,
} from '../../engine';
import { prefersReducedMotion } from '../../lib/motion';
import { catalogFrom, categoryFromSearch, initialDebate } from './init';
import type { DebateData, DebateRivalry } from './types';
import { sendVote } from './votes';

/** Durée de sortie des cartes avant l'entrée de la rivalité suivante (< 300 ms avec l'entrée). */
export const EXIT_MS = 130;

/** Comment la rivalité affichée s'en va : une team choisie (elle gagne, l'autre tombe) ou un passage. */
export type Exit = Choice | 'skip' | null;
/** Clé de l'ancien mode « duels », nettoyée au passage. */
const LEGACY_STORAGE_KEY = '484:game';

export interface VoteResult {
  /** Change à chaque vote : sert de clé pour rejouer l'animation « pop ». */
  id: number;
  rivalryId: string;
  team: Choice;
  /** null tant que l'API n'a pas répondu (au plus 1,5 s). */
  outcome: ShareOutcome | null;
  /** Votes des quatre choix (détail sous la barre), si l'API les a donnés. */
  split: { a: number; b: number; none: number; both: number } | null;
  quip: string | null;
}

/** Remarque écrite pour ce choix sur ce duel, s'il y en a une. */
export function customQuip(rivalry: DebateRivalry | undefined, choice: Choice): string | undefined {
  if (!rivalry) return undefined;
  if (choice === 'both') return rivalry.bothQuip;
  if (choice === 'none') return rivalry.noneQuip;
  return rivalry[choice].quip;
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
  /** Choix fait sur le duel affiché : il reste à l'écran, tranché, jusqu'à `next()`. */
  const [decided, setDecided] = useState<Choice | null>(null);
  const decidedRef = useRef<Choice | null>(null);
  decidedRef.current = decided;
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
  // Catégorie terminée : /jouer?theme=<catégorie>, pour qu'un rechargement ne rouvre pas le dernier débat.
  // replaceState : on ne remplit pas l'historique, le bouton « retour » quitte le jeu.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.pathname = shown === null ? '/jouer' : `/debat/${shown}`;
    url.searchParams.set('theme', state.category);
    if (url.href !== window.location.href) window.history.replaceState(null, '', url);
  }, [shown, state.category]);

  /** Fait sortir la rivalité affichée puis entrer `nextShown` (ou l'écran de fin si null). */
  const leave = useCallback((nextShown: string | null, how: Exclude<Exit, null>) => {
    if (prefersReducedMotion()) {
      setShown(nextShown);
      setDecided(null);
      return;
    }
    busy.current = true;
    setExit(how);
    window.setTimeout(() => {
      setShown(nextShown);
      setDecided(null);
      setExit(null);
      busy.current = false;
    }, EXIT_MS);
  }, []);

  /** Applique un nouvel état et fait entrer sa rivalité tout de suite (passage, catégorie). */
  const advance = useCallback(
    (next: DebateState, how: Exclude<Exit, null>) => {
      setState(next);
      leave(next.current, how);
    },
    [leave],
  );

  /** Après un vote : on quitte le duel tranché pour le suivant. */
  const next = useCallback(() => {
    const how = decidedRef.current;
    if (busy.current || how === null) return;
    pendingVote.current = -1;
    setResult(null);
    setAchievement(null);
    leave(stateRef.current.current, how);
  }, [leave]);

  const choose = useCallback(
    (team: Choice) => {
      if (busy.current || decidedRef.current !== null) return;
      const current = stateRef.current;
      const rivalryId = current.current;
      if (rivalryId === null) return; // catégorie terminée : plus rien à trancher
      const transition = vote(current, team, ctx);
      const id = transition.state.count;
      pendingVote.current = id;

      setResult({ id, rivalryId, team, outcome: null, quip: null, split: null });
      setAchievement(null);
      // Le duel tranché reste affiché, avec son résultat : le suivant attend `next()`.
      setState(transition.state);
      setDecided(team);

      void sendVote({ rivalryId, team, category: current.category }).then((pair) => {
        const outcome = shareOutcome(pair);
        // Le profil compte toujours ce vote, même si un autre a eu lieu depuis.
        if (pendingVote.current !== id) {
          setState((s) => recordOutcome(s, rivalryId, outcome));
          return;
        }
        // Remarque sur mesure du duel si elle existe, sinon une générique selon le pourcentage.
        const custom = customQuip(
          data.rivalries.find((r) => r.id === rivalryId),
          team,
        );
        const quip = custom
          ? { text: custom, state: stateRef.current }
          : debateQuip(stateRef.current, data.texts.quips, outcome, ctx.rng);
        setState((s) => ({
          ...recordOutcome(s, rivalryId, outcome),
          lastQuipKey: quip.state.lastQuipKey,
        }));
        const split = pair?.split ?? null;
        setResult((r) => (r && r.id === id ? { ...r, outcome, quip: quip.text, split } : r));
      });
    },
    [ctx, data],
  );

  const skip = useCallback(() => {
    if (busy.current || decidedRef.current !== null || stateRef.current.current === null) return;
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

  /** « Rejouer cette catégorie » : rien ne sort de l'écran, le premier débat entre tout de suite. */
  const replay = useCallback(() => {
    if (busy.current) return;
    pendingVote.current = -1;
    setResult(null);
    setAchievement(null);
    const next = replayCategory(stateRef.current, ctx);
    setState(next);
    setShown(next.current);
    setDecided(null);
  }, [ctx]);

  return {
    state,
    ctx,
    shown,
    exit,
    decided,
    result,
    achievement,
    choose,
    next,
    skip,
    selectCategory,
    replay,
  };
}
