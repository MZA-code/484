/**
 * Îlot de débat : catégories, rivalité en cours, résultat, palier, « Tes teams » et « Ton profil ».
 * Rendu uniquement côté client (la partie dépend du stockage local et de l'URL).
 */
import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  debateNumber,
  MIXED_CATEGORY,
  remainingIn,
  universeOf,
  type Choice,
  type Team,
} from '../../engine';
import { teamColors } from '../../lib/color';
import { formatText } from '../../lib/format';
import { useReducedMotion } from '../../lib/motion';
import { AchievementIcon } from './AchievementIcon';
import { Finished, type Suggestion } from './Finished';
import { prefetchDuels, preloadGif, teamGifKey } from './gifs';
import { Panels } from './Panels';
import { Result } from './Result';
import { TeamCard } from './TeamCard';
import type { DebateData, DebateRivalry } from './types';
import { useDebate } from './useDebate';
import './debate.css';

/**
 * Lettres du VS, dessinées (lettrage) : épaisses, noires, avec l'ombre crème décalée des cartes.
 * Le V est un tracé plein aux pointes coupées net, le S un seul trait épais.
 */
const VS_PATHS = {
  v: { d: 'M8 6H40L50 64L60 6H92L65 114H35Z', fill: true },
  s: {
    d: 'M80 32C80 17 67 9 50 9C32 9 21 19 21 34C21 50 35 55 50 60C65 65 79 70 79 86C79 101 67 111 50 111C32 111 21 102 21 87',
    fill: false,
  },
} as const;

function VsLetter({ letter }: { letter: keyof typeof VS_PATHS }) {
  const { d, fill } = VS_PATHS[letter];
  const paint = (color: string) =>
    fill
      ? { fill: color }
      : { fill: 'none', stroke: color, 'stroke-width': 22, 'stroke-linecap': 'butt' as const };
  return (
    <svg class="vs-letter" viewBox="0 0 100 120" aria-hidden="true">
      <path d={d} transform="translate(7 7)" {...paint('var(--fg)')} />
      <path d={d} {...paint('var(--ink)')} />
    </svg>
  );
}

/** Catégories proposées sur l'écran de fin. */
const MAX_SUGGESTIONS = 4;

/** Ne pas détourner les flèches quand on tape du texte ou avec un raccourci système. */
function shouldIgnoreKey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true;
  const target = event.target as HTMLElement | null;
  return !!target?.closest('input, textarea, select, [contenteditable="true"]');
}

/** Partage natif (téléphone) si disponible, sinon copie du lien. Renvoie vrai si le lien a été copié. */
async function shareDebate(title: string, text: string): Promise<boolean> {
  const url = window.location.href;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return false;
    } catch {
      // Partage annulé ou refusé : on se rabat sur la copie.
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export default function Debate({
  data,
  initialRivalry,
}: {
  data: DebateData;
  initialRivalry?: string | undefined;
}) {
  const {
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
  } = useDebate(data, initialRivalry);
  const [copied, setCopied] = useState(false);
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

  // Préchargement : les plans et GIF choisis à la main des prochains duels, par lots (quota de
  // Giphy), puis les GIF de la rivalité en cours et de la suivante, pour enchaîner sans attente.
  useEffect(() => {
    prefetchDuels(state.current ? [state.current, ...state.queue] : state.queue);
    for (const id of [state.current, state.queue[0]]) {
      if (!id) continue;
      preloadGif(teamGifKey(id, 'a'), reducedMotion);
      preloadGif(teamGifKey(id, 'b'), reducedMotion);
    }
  }, [state.current, state.queue, reducedMotion]);

  // Le titre de l'onglet suit la question affichée (favoris, historique, partage).
  useEffect(() => {
    if (shown === null) {
      const all = state.category === MIXED_CATEGORY;
      document.title = `${all ? t.finished.allTitle : t.finished.title} · 484`;
      return;
    }
    const rivalry = byId.get(shown);
    if (!rivalry) return;
    const q = rivalry.question ?? formatText(t.question, { a: rivalry.a.name, b: rivalry.b.name });
    document.title = `${q} · 484`;
  }, [shown, byId, t, state.category]);

  /** Catégories où il reste à trancher, celles du même univers d'abord (écran de fin). */
  const suggestions = useMemo((): Suggestion[] => {
    if (shown !== null) return [];
    const universe = universeOf(ctx.catalog, state.category);
    const ids = ctx.catalog.categoryIds.filter(
      (id) => id !== MIXED_CATEGORY && id !== state.category,
    );
    const sameUniverse = (id: string) => (universe?.categories.includes(id) ? 0 : 1);
    return [...ids]
      .sort((x, y) => sameUniverse(x) - sameUniverse(y))
      .map((id) => ({
        id,
        label: labels.get(id) ?? id,
        remaining: remainingIn(state, ctx.catalog, id),
      }))
      .filter((s) => s.remaining > 0)
      .slice(0, MAX_SUGGESTIONS);
  }, [shown, state, ctx, labels]);

  // Clavier : ← team de gauche, → team de droite, ↑ les deux, ↓ aucun des deux,
  // Échap retour à l'accueil. Duel tranché à l'écran : une flèche ou Entrée passe au suivant
  // (un double appui ne vote donc jamais sur un duel qu'on n'a pas encore vu).
  useEffect(() => {
    const keys: Record<string, Choice> = {
      ArrowLeft: 'a',
      ArrowRight: 'b',
      ArrowUp: 'both',
      ArrowDown: 'none',
    };
    const onKey = (event: KeyboardEvent) => {
      if (shouldIgnoreKey(event)) return;
      const picked = keys[event.key];
      // Entrée sur un bouton ou un lien garde son sens : on ne la prend que hors de tout contrôle.
      const enter = event.key === 'Enter' && event.target === document.body;
      if (decided !== null && (picked || enter)) {
        event.preventDefault();
        if (!event.repeat) next();
      } else if (picked) {
        event.preventDefault();
        if (event.repeat) return;
        choose(picked);
      } else if (event.key === 'Escape') {
        window.location.assign('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, next, decided]);

  const activeUniverse = universeOf(ctx.catalog, state.category);
  const rivalry = shown === null ? undefined : byId.get(shown);
  if (shown !== null && !rivalry) return null;
  const lastRivalry = result ? byId.get(result.rivalryId) : undefined;
  const lastColors = teamColors(result?.rivalryId ?? rivalry?.id ?? '');
  // Le moteur compte déjà le vote : le duel tranché encore affiché garde son numéro.
  const number = debateNumber(state) - (decided === null ? 0 : 1);

  /** La rivalité affichée : question, deux cartes, autres réponses. */
  const debateStage = (rivalry: DebateRivalry) => {
    const colors = teamColors(rivalry.id);
    const names = { a: rivalry.a.name, b: rivalry.b.name };
    const question = rivalry.question ?? formatText(t.question, names);
    const onShare = () => {
      void shareDebate(question, formatText(t.shareText, names)).then((didCopy) => {
        setCopied(didCopy);
        if (didCopy) window.setTimeout(() => setCopied(false), 2500);
      });
    };

    const card = (side: Team) => (
      <div class="team-slot" key={`${rivalry.id}-${side}`}>
        <TeamCard
          team={rivalry[side]}
          side={side}
          gifKey={teamGifKey(rivalry.id, side)}
          stillOnly={reducedMotion}
          color={colors[side === 'a' ? 0 : 1]}
          decided={decided}
          exit={exit}
          label={t.team}
          onChoose={choose}
        />
      </div>
    );

    return (
      <>
        <div class={`debate-question${exit ? ' is-leaving' : ''}`} key={rivalry.id}>
          {state.category !== rivalry.category && (
            <p class="debate-category">{labels.get(rivalry.category)}</p>
          )}
          <h1 class="debate-title">{question}</h1>
        </div>

        <div class="arena">
          {card('a')}
          {/* « V » et « S » aux couleurs des deux cartes, séparés par une fente en biais. */}
          <span
            class="vs"
            aria-hidden="true"
            key={`vs-${rivalry.id}`}
            style={{ '--vs-a': colors[0], '--vs-b': colors[1] }}
          >
            <span class="vs-half vs-v">
              <VsLetter letter="v" />
            </span>
            <span class="vs-half vs-s">
              <VsLetter letter="s" />
            </span>
          </span>
          {card('b')}
        </div>

        {/* En haut, les deux autres réponses ; en dessous, passer et partager (pas des votes). */}
        {/* Duel tranché : les votes et « Passer » se figent, le choix fait reste marqué. */}
        <div class="debate-actions">
          <div class="debate-actions-row">
            {(['both', 'none'] as const).map((answer) => (
              <button
                key={answer}
                type="button"
                class={`skip-button ${answer}-button${decided === answer ? ' is-picked' : ''}`}
                disabled={decided !== null}
                onClick={() => choose(answer)}
              >
                <AchievementIcon svg={data.icons[answer]} class="action-icon" />
                {t[answer].button}
              </button>
            ))}
          </div>
          <div class="debate-actions-row debate-actions-row--minor">
            <button
              type="button"
              class="skip-button pass-button"
              disabled={decided !== null}
              onClick={skip}
            >
              <AchievementIcon svg={data.icons.skip} class="action-icon" />
              {t.skip}
            </button>
            <button type="button" class="skip-button share-button" onClick={onShare}>
              <AchievementIcon svg={data.icons.share} class="action-icon" />
              {t.shareButton}
            </button>
          </div>
          <p class="share-feedback" aria-live="polite">
            {copied && <span class="pop">{t.shareCopied}</span>}
          </p>
        </div>
      </>
    );
  };

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

      {/* Pas de « Débat n° X » ni de « Ça ne s'arrête jamais » sur l'écran de fin. */}
      {rivalry && (
        <div class="debate-head">
          <p class="debate-number">
            <span class="debate-number-value" key={number}>
              {formatText(t.number, { n: number })}
            </span>
          </p>
          <p class="debate-subtitle">{t.subtitle}</p>
        </div>
      )}

      <div class="debate-stage">
        {rivalry ? (
          debateStage(rivalry)
        ) : (
          <Finished
            key={state.category}
            id={state.category}
            category={state.category === MIXED_CATEGORY ? null : (labels.get(state.category) ?? '')}
            line={data.categories.find((c) => c.id === state.category)?.finishLine}
            total={ctx.catalog.pools.get(state.category)?.length ?? 0}
            reducedMotion={reducedMotion}
            suggestions={suggestions}
            texts={t.finished}
            onSelect={selectCategory}
            onReplay={replay}
          />
        )}

        <Result
          reducedMotion={reducedMotion}
          result={result}
          rivalry={lastRivalry}
          colors={lastColors}
          achievement={achievement}
          onNext={next}
          texts={data.texts}
        />
      </div>

      <Panels
        state={state}
        hallScope={activeUniverse?.id ?? MIXED_CATEGORY}
        byId={byId}
        catalog={ctx.catalog}
        texts={data.texts}
      />
    </div>
  );
}
