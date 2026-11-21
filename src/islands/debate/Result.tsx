/**
 * Bandeau de résultat après un vote, et bandeau de palier.
 * La zone est une région « live » : les lecteurs d'écran annoncent chaque résultat.
 */
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
}

export function Result({ result, rivalry, colors, milestone, texts }: Props) {
  const t = texts.debate;
  const reached = milestone === null ? undefined : texts.milestones[String(milestone)];
  const team = result && rivalry ? rivalry[result.team] : undefined;
  const outcome = result?.outcome;
  // Part de chaque camp : le pourcentage reçu est celui de la team choisie.
  const aPercent =
    outcome?.kind === 'share'
      ? result?.team === 'a'
        ? outcome.percent
        : 100 - outcome.percent
      : 0;

  return (
    <>
      {/* Le résultat se colle en bas de l'écran : visible sans défiler, sans décaler les cartes. */}
      <div class={`result-dock${result && team ? ' is-docked' : ''}`} aria-live="polite">
        {result && team ? (
          <div class="result pop" key={result.id}>
            <p class="result-choice">
              {fill(t.choice, { name: <strong>{team.name}</strong> })}
              {outcome?.kind === 'share' && (
                <span class="pop"> · {formatText(t.share, { percent: outcome.percent })}</span>
              )}
            </p>
            {outcome?.kind === 'share' && rivalry && (
              <>
                <span class="result-bar" aria-hidden="true">
                  <span
                    class="result-bar-a"
                    style={{ width: `${aPercent}%`, background: colors[0] }}
                  />
                  <span class="result-bar-b" style={{ background: colors[1] }} />
                </span>
                <span class="result-split" aria-hidden="true">
                  <span>
                    {rivalry.a.name} · {aPercent} %
                  </span>
                  <span>
                    {100 - aPercent} % · {rivalry.b.name}
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

      {reached && (
        <div class="milestone pop" key={`milestone-${milestone}`}>
          <p class="milestone-text">{reached.text}</p>
          {reached.link && texts.linkedinUrl && (
            <a class="milestone-link" href={texts.linkedinUrl} target="_blank" rel="noopener">
              {t.milestoneLink}
            </a>
          )}
        </div>
      )}
    </>
  );
}
