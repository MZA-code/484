/**
 * Bandeaux sous l'en-tête du duel : résultat du vote, paliers et retraites.
 * La zone est une région « live » : les lecteurs d'écran annoncent chaque résultat.
 */
import { colorFor } from '../../lib/color';
import { formatText } from '../../lib/format';
import type { GameContender, GameData } from './types';
import type { Notice, VoteResult } from './useGame';

interface Props {
  result: VoteResult | null;
  notices: Notice[];
  texts: GameData['texts'];
  byId: ReadonlyMap<string, GameContender>;
}

export function Banners({ result, notices, texts, byId }: Props) {
  const winner = result ? byId.get(result.winnerId) : undefined;
  return (
    <div class="banners" aria-live="polite">
      {result && winner ? (
        <div class="banner banner--result pop" key={result.id}>
          <p class="banner-choice">
            <strong>{formatText(texts.duel.choice, { name: winner.name })}</strong>
            {result.outcome?.kind === 'share' && (
              <span class="banner-share pop">
                {' · '}
                {formatText(texts.duel.share, { percent: result.outcome.percent })}
              </span>
            )}
          </p>
          {result.outcome?.kind === 'share' && (
            <span class="banner-bar" aria-hidden="true">
              <span
                class="banner-bar-fill"
                style={{ width: `${result.outcome.percent}%`, background: colorFor(winner.id) }}
              />
            </span>
          )}
          {result.outcome?.kind === 'first' && <p class="pop">{texts.duel.firstVote}</p>}
          {result.quip ? (
            <p class="banner-quip pop">{result.quip}</p>
          ) : (
            <p class="banner-quip banner-pending" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </p>
          )}
        </div>
      ) : (
        <p class="banner-hint">{texts.duel.keysHint}</p>
      )}

      {notices.map((notice) => {
        if (notice.kind === 'retired') {
          const name = byId.get(notice.contenderId)?.name ?? '';
          return (
            <div class="banner banner--retired pop" key={`retired-${result?.id}`}>
              <p>{formatText(texts.duel.retired, { name, n: notice.streak })}</p>
            </div>
          );
        }
        const milestone = texts.milestones[String(notice.count)];
        if (!milestone) return null;
        return (
          <div class="banner banner--milestone pop" key={`milestone-${notice.count}`}>
            <p>{milestone.text}</p>
            {milestone.link && texts.linkedinUrl && (
              <a class="block-button" href={texts.linkedinUrl} target="_blank" rel="noopener">
                {texts.duel.milestoneLink}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
