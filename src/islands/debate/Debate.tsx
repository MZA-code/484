/**
 * Îlot de débat : catégories, rivalité en cours, résultat, palier, « Tes teams » et « Ton profil ».
 * Rendu uniquement côté client (la partie dépend du stockage local et de l'URL).
 */
import { useEffect, useMemo } from 'preact/hooks';
import { debateNumber, MIXED_CATEGORY, universeOf, type Team } from '../../engine';
import { teamColors } from '../../lib/color';
import { formatText } from '../../lib/format';
import { useReducedMotion } from '../../lib/motion';
import { preloadGif, teamGifKey } from './gifs';
import { Panels } from './Panels';
import { Result } from './Result';
import { TeamCard } from './TeamCard';
import type { DebateData } from './types';
import { useDebate } from './useDebate';
import './debate.css';

/** Ne pas détourner les flèches quand on tape du texte ou avec un raccourci système. */
function shouldIgnoreKey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true;
  const target = event.target as HTMLElement | null;
  return !!target?.closest('input, textarea, select, [contenteditable="true"]');
}

export default function Debate({ data }: { data: DebateData }) {
  const { state, ctx, shown, exit, result, milestone, choose, skip, selectCategory } =
    useDebate(data);
  const t = data.texts.debate;
  const reducedMotion = useReducedMotion();

  const byId = useMemo(() => new Map(data.rivalries.map((r) => [r.id, r])), [data]);
  const labels = useMemo(
    () =>
      new Map([
        [MIXED_CATEGORY, data.texts.mixedLabel],
        ...data.universes.map((u) => [u.id, u.label] as const),
        ...data.categories.map((c) => [c.id, c.label] as const),
      ]),
    [data],
  );

  // Préchargement : les GIF de la rivalité en cours et de la suivante, pour un enchaînement sans attente.
  useEffect(() => {
    for (const id of [state.current, state.queue[0]]) {
      if (!id) continue;
      preloadGif(teamGifKey(id, 'a'), reducedMotion);
      preloadGif(teamGifKey(id, 'b'), reducedMotion);
    }
  }, [state.current, state.queue, reducedMotion]);

  // Clavier : ← team de gauche, → team de droite, Échap retour à l'accueil.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (shouldIgnoreKey(event)) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (!event.repeat) choose(event.key === 'ArrowLeft' ? 'a' : 'b');
      } else if (event.key === 'Escape') {
        window.location.assign('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose]);

  const activeUniverse = universeOf(ctx.catalog, state.category);
  const rivalry = byId.get(shown);
  if (!rivalry) return null;
  const colors = teamColors(rivalry.id);
  const lastRivalry = result ? byId.get(result.rivalryId) : undefined;
  const lastColors = result ? teamColors(result.rivalryId) : colors;
  const question =
    rivalry.question ?? formatText(t.question, { a: rivalry.a.name, b: rivalry.b.name });

  const card = (side: Team) => (
    <TeamCard
      key={`${rivalry.id}-${side}`}
      team={rivalry[side]}
      side={side}
      gifKey={teamGifKey(rivalry.id, side)}
      stillOnly={reducedMotion}
      color={colors[side === 'a' ? 0 : 1]}
      exit={exit}
      label={t.team}
      chooseLabel={t.choose}
      onChoose={choose}
    />
  );

  return (
    <div class="debate">
      {/* Premier niveau : « Tout mélangé » et les univers. */}
      <nav class="category-tabs" aria-label={t.universesLabel}>
        {[MIXED_CATEGORY, ...ctx.catalog.universes.map((u) => u.id)].map((id) => (
          <button
            key={id}
            type="button"
            class="category-tab"
            aria-pressed={
              id === MIXED_CATEGORY ? state.category === MIXED_CATEGORY : activeUniverse?.id === id
            }
            onClick={() => selectCategory(id)}
          >
            {labels.get(id)}
          </button>
        ))}
      </nav>
      {/* Second niveau : tout l'univers, ou une de ses catégories. */}
      {activeUniverse && (
        <nav class="category-tabs category-tabs--sub" aria-label={t.categoriesLabel}>
          {[activeUniverse.id, ...activeUniverse.categories].map((id) => (
            <button
              key={id}
              type="button"
              class="category-tab category-tab--sub"
              aria-pressed={state.category === id}
              onClick={() => selectCategory(id)}
            >
              {id === activeUniverse.id ? t.wholeUniverse : labels.get(id)}
            </button>
          ))}
        </nav>
      )}

      <div class="debate-head">
        <p class="debate-number">
          <span class="debate-number-value" key={state.count}>
            {formatText(t.number, { n: debateNumber(state) })}
          </span>
        </p>
        <p class="debate-subtitle">{t.subtitle}</p>
      </div>

      <div class="debate-stage">
        <div class={`debate-question${exit ? ' is-leaving' : ''}`} key={rivalry.id}>
          {state.category !== rivalry.category && (
            <p class="debate-category">{labels.get(rivalry.category)}</p>
          )}
          <h1 class="debate-title">{question}</h1>
        </div>

        <div class="arena">
          {card('a')}
          <span class="vs" aria-hidden="true" key={`vs-${rivalry.id}`}>
            {t.vs}
          </span>
          {card('b')}
        </div>

        <div class="debate-actions">
          <button type="button" class="skip-button" onClick={skip}>
            {t.skip}
          </button>
        </div>

        <Result
          reducedMotion={reducedMotion}
          result={result}
          rivalry={lastRivalry}
          colors={lastColors}
          milestone={milestone}
          texts={data.texts}
        />
      </div>

      <Panels
        state={state}
        hallScope={activeUniverse?.id ?? MIXED_CATEGORY}
        byId={byId}
        texts={data.texts}
      />
    </div>
  );
}
