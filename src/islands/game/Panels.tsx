/** Les deux panneaux sous les duels : « Ton top 5 » et « Records ». */
import { records, topContenders, type GameContext, type GameState } from '../../engine';
import { colorFor } from '../../lib/color';
import { formatText, plural } from '../../lib/format';
import type { GameContender, GameData } from './types';

interface Props {
  state: GameState;
  ctx: GameContext;
  texts: GameData['texts'];
  byId: ReadonlyMap<string, GameContender>;
}

export function Panels({ state, ctx, texts, byId }: Props) {
  const top = topContenders(state).filter((t) => byId.has(t.contenderId));
  const rec = records(state, ctx);
  const best = rec.bestStreak ? byId.get(rec.bestStreak.contenderId) : undefined;
  const t = texts.panels;

  return (
    <div class="panels">
      <section class="panel" aria-labelledby="panel-top">
        <h2 id="panel-top" class="panel-title">
          {t.top.title}
        </h2>
        {top.length === 0 ? (
          <p class="panel-empty">{t.top.empty}</p>
        ) : (
          <ol class="top-list">
            {top.map((entry) => {
              const c = byId.get(entry.contenderId);
              return (
                <li key={entry.contenderId}>
                  <span
                    class="top-swatch"
                    style={{ background: colorFor(entry.contenderId) }}
                    aria-hidden="true"
                  />
                  <span class="top-name">{c?.name}</span>
                  <span class="top-wins">{plural(t.top.wins, entry.wins)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section class="panel" aria-labelledby="panel-records">
        <h2 id="panel-records" class="panel-title">
          {t.records.title}
        </h2>
        <dl class="records">
          <div>
            <dt>{t.records.bestStreak}</dt>
            <dd>
              {best && rec.bestStreak
                ? formatText(t.records.bestStreakValue, {
                    name: best.name,
                    n: rec.bestStreak.length,
                  })
                : t.records.none}
            </dd>
          </div>
          <div>
            <dt>{t.records.retired}</dt>
            <dd>{rec.retiredCount}</dd>
          </div>
          <div>
            <dt>{t.records.pool}</dt>
            <dd>{rec.poolSize}</dd>
          </div>
        </dl>
        <a class="panel-link" href={`/hall-of-fame?theme=${state.theme}`}>
          {t.records.hallLink}
        </a>
      </section>
    </div>
  );
}
