/**
 * Îlot de jeu : onglets de thème, duel en cours, bandeaux et panneaux.
 * Rendu uniquement côté client (la partie dépend du stockage local et de l'URL).
 */
import { useEffect, useMemo, useState } from 'preact/hooks';
import { championSide, duelNumber, MIXED_THEME, type Side } from '../../engine';
import { formatText, plural } from '../../lib/format';
import { Banners } from './Banners';
import { DuelCard } from './DuelCard';
import { preloadGif } from './gifs';
import { Panels } from './Panels';
import type { GameData } from './types';
import { useGame } from './useGame';
import './game.css';

/** Ne pas détourner les flèches quand on tape du texte ou avec un raccourci système. */
function shouldIgnoreKey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true;
  const target = event.target as HTMLElement | null;
  return !!target?.closest('input, textarea, select, [contenteditable="true"]');
}

/** Suit la préférence système « réduire les animations », y compris si elle change en cours de partie. */
function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return;
    const onChange = () => setReduced(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function Game({ data }: { data: GameData }) {
  const { state, ctx, result, notices, leaving, choose, skip, selectTheme } = useGame(data);
  const { texts } = data;
  const reducedMotion = useReducedMotion();

  const byId = useMemo(() => new Map(data.contenders.map((c) => [c.id, c])), [data]);
  const themeLabels = useMemo(
    () =>
      new Map([
        [MIXED_THEME, texts.mixedLabel],
        ...data.themes.map((t) => [t.id, t.label] as const),
      ]),
    [data, texts],
  );

  // Préchargement : les deux prochains de la file (un vote en remplace un, une retraite deux).
  useEffect(() => {
    for (const id of state.queue.slice(0, 2)) preloadGif(id, reducedMotion);
  }, [state.queue, reducedMotion]);

  // Clavier : ← gauche, → droite, Échap retour à l'accueil.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (shouldIgnoreKey(event)) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!event.repeat) choose(event.key === 'ArrowLeft' ? 'left' : 'right');
      } else if (event.key === 'Escape') {
        window.location.assign('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose]);

  const held = championSide(state);
  const card = (side: Side) => {
    const contender = byId.get(side === 'left' ? state.left : state.right);
    if (!contender) return null;
    return (
      <DuelCard
        key={contender.id}
        contender={contender}
        side={side}
        themePrefix={
          state.theme === MIXED_THEME ? (themeLabels.get(contender.theme) ?? null) : null
        }
        badge={held === side ? plural(texts.duel.streakBadge, state.streak) : null}
        leaving={leaving.includes(side)}
        chooseLabel={texts.duel.choose}
        stillOnly={reducedMotion}
        onChoose={choose}
      />
    );
  };

  return (
    <div class="game">
      <nav class="theme-tabs" aria-label={texts.duel.themesLabel}>
        {ctx.catalog.themeIds.map((id) => (
          <button
            key={id}
            type="button"
            class="theme-tab"
            aria-pressed={id === state.theme}
            onClick={() => selectTheme(id)}
          >
            {themeLabels.get(id)}
          </button>
        ))}
      </nav>

      <div class="duel-head">
        <h1 class="duel-number">{formatText(texts.duel.number, { n: duelNumber(state) })}</h1>
        <p class="duel-subtitle">{texts.duel.subtitle}</p>
      </div>

      <Banners result={result} notices={notices} texts={texts} byId={byId} />

      <div class="arena">
        {card('left')}
        <span class="vs" aria-hidden="true">
          {texts.duel.vs}
        </span>
        {card('right')}
      </div>

      <div class="duel-actions">
        <button type="button" class="block-button" onClick={skip}>
          {texts.duel.skip}
        </button>
      </div>

      <Panels state={state} ctx={ctx} texts={texts} byId={byId} />
    </div>
  );
}
