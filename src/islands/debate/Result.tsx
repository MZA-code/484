/**
 * Bandeau de résultat après un vote, et bandeau de palier.
 * La zone est une région « live » : les lecteurs d'écran annoncent chaque résultat
 * (la valeur finale seulement, pas le compteur qui défile).
 */
import { useEffect, useState } from 'preact/hooks';
import { CARD_COLORS } from '../../lib/color';
import { formatText } from '../../lib/format';
import { fill } from './rich';
import type { DebateData, DebateRivalry } from './types';
import type { VoteResult } from './useDebate';

interface Props {
  result: VoteResult | null;
  rivalry: DebateRivalry | undefined;
  /** Couleurs des teams A et B de la rivalité votée. */
  colors: readonly [string, string];
  milestone: number | null;
  texts: DebateData['texts'];
  reducedMotion: boolean;
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

export function Result({ result, rivalry, colors, milestone, texts, reducedMotion }: Props) {
  const t = texts.debate;
  const reached = milestone === null ? undefined : texts.milestones[String(milestone)];
  const team = result && rivalry ? rivalry[result.team] : undefined;
  const outcome = result?.outcome;
  const share = outcome?.kind === 'share' ? outcome.percent : null;
  const shown = useCountUp(share, reducedMotion);
  // Part de chaque camp : le pourcentage reçu est celui de la team choisie.
  const chosenIsA = result?.team === 'a';
  const aFinal = share === null ? 0 : chosenIsA ? share : 100 - share;
  const aShown = shown === null ? 0 : chosenIsA ? shown : 100 - shown;
  const shareText = share === null ? '' : formatText(t.share, { percent: share });

  return (
    <>
      {/* Le résultat se colle en bas de l'écran : visible sans défiler, sans décaler les cartes. */}
      <div class={`result-dock${result && team ? ' is-docked' : ''}`} aria-live="polite">
        {/* Le palier passe dans le bandeau collé : sinon il tomberait sous les cartes, hors de vue. */}
        {reached && (
          <div class="milestone pop" key={`milestone-${milestone}`}>
            {!reducedMotion && <Confetti />}
            <p class="milestone-text">{reached.text}</p>
            {reached.link && texts.linkedinUrl && (
              <a class="milestone-link" href={texts.linkedinUrl} target="_blank" rel="noopener">
                {t.milestoneLink}
              </a>
            )}
          </div>
        )}
        {result && team ? (
          <div class="result" key={result.id}>
            <p class="result-choice">
              {fill(t.choice, { name: <strong>{team.name}</strong> })}
              {share !== null && (
                <span class="result-share">
                  {' · '}
                  <span aria-hidden="true">{formatText(t.share, { percent: shown ?? 0 })}</span>
                  <span class="visually-hidden">{shareText}</span>
                </span>
              )}
            </p>
            {share !== null && rivalry && (
              <>
                <span class="result-bar" aria-hidden="true">
                  <span
                    class="result-bar-a"
                    style={{ width: `${aFinal}%`, background: colors[0] }}
                  />
                  <span class="result-bar-b" style={{ background: colors[1] }} />
                </span>
                <span class="result-split" aria-hidden="true">
                  <span>
                    {rivalry.a.name} · {aShown} %
                  </span>
                  <span>
                    {100 - aShown} % · {rivalry.b.name}
                  </span>
                </span>
              </>
            )}
            {outcome?.kind === 'first' && <p class="result-first pop">{t.firstVote}</p>}
            {result.quip ? (
              <p class="result-quip pop">{result.quip}</p>
            ) : (
              <p class="result-quip result-pending" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
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
