/**
 * Bandeau de résultat après un vote, et bandeau « Achievement débloqué ».
 * La zone est une région « live » : les lecteurs d'écran annoncent chaque résultat
 * (la valeur finale seulement, pas le compteur qui défile).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { CARD_COLORS } from '../../lib/color';
import { formatText } from '../../lib/format';
import { AchievementIcon } from './AchievementIcon';
import { fill } from './rich';
import type { DebateData, DebateRivalry } from './types';
import type { Achievement, VoteResult } from './useDebate';

interface Props {
  result: VoteResult | null;
  rivalry: DebateRivalry | undefined;
  /** Couleurs des teams A et B de la rivalité votée. */
  colors: readonly [string, string];
  achievement: Achievement | null;
  texts: DebateData['texts'];
  reducedMotion: boolean;
  /** Passe au duel suivant, à la fin du décompte. */
  onNext: () => void;
}

/** Fait défiler un nombre de 0 jusqu'à `target` (ou l'affiche tout de suite si les animations sont réduites). */
function useCountUp(target: number | null, reduced: boolean, durationMs = 650): number | null {
  const [value, setValue] = useState<number | null>(reduced ? target : target === null ? null : 0);
  useEffect(() => {
    if (target === null || reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced, durationMs]);
  return value;
}

/** Gerbe de confettis aux couleurs du site, pour fêter un palier. Purement décorative. */
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.3;
    const distance = 120 + ((i * 37) % 110);
    return {
      '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
      '--dy': `${Math.round(Math.sin(angle) * distance * 0.7 - 40)}px`,
      '--rot': `${(i * 67) % 360}deg`,
      '--delay': `${(i % 5) * 25}ms`,
      background: CARD_COLORS[i % CARD_COLORS.length],
    };
  });
  return (
    <span class="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </span>
  );
}

/** Parts arrondies en %, pour la barre et sa légende. */
interface Parts {
  /** Le duel : team A et team B parmi ceux qui ont choisi une team (100 % à eux deux). */
  a: number;
  b: number;
  /** « Les deux » et « aucun des deux », en % de tous les votes (écrits sous la barre). */
  both: number;
  none: number;
}

/**
 * Parts de la barre. Avec le détail des choix, on le suit ; sans lui (ancienne réponse), on
 * déduit le duel du pourcentage du choix du visiteur. null si on ne peut rien dessiner de juste.
 */
function splitParts(result: VoteResult, share: number): Parts | null {
  const split = result.split;
  const total = split ? split.a + split.b + split.none + split.both : 0;
  if (split && total > 0) {
    const sided = split.a + split.b;
    if (sided === 0) return null;
    const a = Math.round((split.a / sided) * 100);
    const pct = (n: number) => Math.round((n / total) * 100);
    return { a, b: 100 - a, both: pct(split.both), none: pct(split.none) };
  }
  if (result.team !== 'a' && result.team !== 'b') return null;
  const a = result.team === 'a' ? share : 100 - share;
  return { a, b: 100 - a, both: 0, none: 0 };
}

/** En dessous de cette part, le pourcentage n'est pas écrit dans la barre (pas la place). */
const MIN_LABEL_PERCENT = 10;

/** Délai avant le duel suivant, une fois la remarque arrivée (assez pour lire, pas plus). */
export const RESULT_LIFETIME_MS = 6_000;

/**
 * Décompte du bandeau `key` : `onExpire` est appelé `RESULT_LIFETIME_MS` après `ready`. Il se met
 * en pause quand on survole ou parcourt le bandeau au clavier, et quand l'onglet est caché.
 */
function useLifetime(key: number | null, ready: boolean, onExpire: () => void) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  /** Temps restant du bandeau en cours (remis à plein à chaque nouveau vote). */
  const remaining = useRef({ key, ms: RESULT_LIFETIME_MS });
  const expire = useRef(onExpire);
  expire.current = onExpire;
  const paused = hovered || focused || tabHidden;

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Nouveau bandeau : on repart sans pause. Un lien du bandeau qui avait le focus a pu disparaître
  // sans le rendre (pas de focusout dans certains navigateurs).
  useEffect(() => setFocused(false), [key]);

  useEffect(() => {
    if (remaining.current.key !== key) remaining.current = { key, ms: RESULT_LIFETIME_MS };
    if (key === null || !ready || paused) return;
    const started = performance.now();
    const timer = window.setTimeout(() => expire.current(), remaining.current.ms);
    return () => {
      window.clearTimeout(timer);
      if (remaining.current.key === key) remaining.current.ms -= performance.now() - started;
    };
  }, [key, ready, paused]);

  return {
    paused,
    handlers: {
      // Souris seulement : sur écran tactile, un tap « survolerait » le bandeau pour de bon.
      onPointerEnter: (event: PointerEvent) => setHovered(event.pointerType === 'mouse'),
      onPointerLeave: () => setHovered(false),
      onFocusIn: () => setFocused(true),
      onFocusOut: () => setFocused(false),
    },
  };
}

export function Result(props: Props) {
  const { result, rivalry, colors, achievement, texts, reducedMotion, onNext } = props;
  const t = texts.debate;
  const life = useLifetime(result?.id ?? null, !!result?.quip, onNext);
  const reached = achievement;
  const choice = result?.team;
  const team =
    result && rivalry && (choice === 'a' || choice === 'b') ? rivalry[choice] : undefined;
  const outcome = result?.outcome;
  const share = outcome?.kind === 'share' ? outcome.percent : null;
  const shown = useCountUp(share, reducedMotion);
  const parts = share === null || !result ? null : splitParts(result, share);
  // Le détail défile avec le pourcentage du choix du visiteur.
  const progress = share && shown !== null ? shown / share : 1;
  const counted = (n: number) => Math.round(n * progress);
  const shareText = share === null ? '' : formatText(t.share, { percent: share });
  const choiceText = team
    ? fill(t.choice, { name: <strong>{team.name}</strong> })
    : choice === 'both' || choice === 'none'
      ? t[choice].choice
      : null;

  return (
    <>
      {/* Le résultat se colle en bas de l'écran : visible sans défiler, sans décaler les cartes. */}
      <div
        class={`result-dock${result && rivalry ? ' is-docked' : ''}`}
        aria-live="polite"
        {...life.handlers}
      >
        {/* Le palier passe dans le bandeau collé : sinon il tomberait sous les cartes, hors de vue. */}
        {reached && (
          <div class="milestone pop" key={`achievement-${reached.id}`}>
            {!reducedMotion && <Confetti />}
            <div class="milestone-body">
              <p class="milestone-label">
                <AchievementIcon svg={reached.svg} class="milestone-icon" />
                {texts.achievements.unlocked} · <strong>{reached.name}</strong>
              </p>
              <p class="milestone-text">{reached.text}</p>
            </div>
            {reached.link && texts.linkedinUrl && (
              <a class="milestone-link" href={texts.linkedinUrl} target="_blank" rel="noopener">
                {t.milestoneLink}
              </a>
            )}
          </div>
        )}
        {result && rivalry && choiceText ? (
          <div class="result" key={result.id}>
            {/* Le temps qui reste avant le duel suivant. */}
            {result.quip && (
              <span
                class="result-timer"
                aria-hidden="true"
                style={{
                  animationDuration: `${RESULT_LIFETIME_MS}ms`,
                  animationPlayState: life.paused ? 'paused' : 'running',
                }}
              />
            )}
            {/* Le choix et sa part ne sont plus écrits (la remarque et la barre les disent) : on les garde pour les lecteurs d'écran. */}
            <p class="visually-hidden">
              {choiceText}
              {share !== null && ` · ${shareText}`}
            </p>
            {result.quip ? (
              <p class="result-quip pop">{result.quip}</p>
            ) : (
              <p class="result-quip result-pending" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            )}
            {outcome?.kind === 'first' && <p class="result-first pop">{t.firstVote}</p>}
            {/* La barre aux couleurs des cartes : la team de gauche contre la team de droite. */}
            {parts && (
              <div class="result-meter" aria-hidden="true">
                <span class="result-meter-track">
                  <span
                    class={`result-meter-seg${choice === 'a' ? ' is-picked' : ''}`}
                    style={{ width: `${parts.a}%`, background: colors[0] }}
                  >
                    {parts.a >= MIN_LABEL_PERCENT && (
                      <span class="result-meter-pct">{counted(parts.a)} %</span>
                    )}
                  </span>
                  <span
                    class={`result-meter-seg result-meter-b${choice === 'b' ? ' is-picked' : ''}`}
                    style={{ background: colors[1] }}
                  >
                    {parts.b >= MIN_LABEL_PERCENT && (
                      <span class="result-meter-pct">{counted(parts.b)} %</span>
                    )}
                  </span>
                </span>
                <span class="result-split">
                  <span class={choice === 'a' ? 'is-picked' : undefined}>{rivalry.a.name}</span>
                  {(parts.both > 0 || parts.none > 0) && (
                    <span class="result-split-other">
                      {parts.both > 0 && (
                        <span class={choice === 'both' ? 'is-picked' : undefined}>
                          {formatText(t.both.split, { percent: counted(parts.both) })}
                        </span>
                      )}
                      {parts.both > 0 && parts.none > 0 && ' · '}
                      {parts.none > 0 && (
                        <span class={choice === 'none' ? 'is-picked' : undefined}>
                          {formatText(t.none.split, { percent: counted(parts.none) })}
                        </span>
                      )}
                    </span>
                  )}
                  <span class={choice === 'b' ? 'is-picked' : undefined}>{rivalry.b.name}</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <p class="result-hint">
            <span class="hint-keys">{t.keysHint}</span>
            <span class="hint-touch">{t.pickHint}</span>
          </p>
        )}
      </div>
    </>
  );
}
