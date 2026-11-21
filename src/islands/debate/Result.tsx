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
  color: string;
  milestone: number | null;
  texts: DebateData['texts'];
}

export function Result({ result, rivalry, color, milestone, texts }: Props) {
  const t = texts.debate;
  const reached = milestone === null ? undefined : texts.milestones[String(milestone)];
  const team = result && rivalry ? rivalry[result.team] : undefined;
  const outcome = result?.outcome;

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
            {outcome?.kind === 'share' && (
              <span class="result-bar" aria-hidden="true">
                <span
                  class="result-bar-fill"
                  style={{ width: `${outcome.percent}%`, background: color }}
                />
              </span>
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
