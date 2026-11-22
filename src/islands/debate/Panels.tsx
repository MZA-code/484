/** Les panneaux sous le débat : « Tes teams » (derniers choix), « Ton profil » et « Tes achievements ». */
import {
  achievementProgress,
  nextAchievement,
  profile,
  type DebateCatalog,
  type DebateState,
} from '../../engine';
import { formatText, plural } from '../../lib/format';
import { AchievementIcon } from './AchievementIcon';
import type { DebateData, DebateRivalry } from './types';

interface Props {
  state: DebateState;
  /** Filtre du Hall of Fame correspondant à la partie : son univers, ou « mix ». */
  hallScope: string;
  byId: ReadonlyMap<string, DebateRivalry>;
  catalog: DebateCatalog;
  texts: DebateData['texts'];
}

/** Nombres à la française : « 1 000 ». */
const number = (n: number) => n.toLocaleString('fr-FR');

/** Nombre de choix affichés dans « Tes teams ». */
const SHOWN = 5;

export function Panels({ state, hallScope, byId, catalog, texts }: Props) {
  const t = texts.debate;
  const a = texts.achievements;
  const p = profile(state);
  const progress = achievementProgress(state, a.list, catalog);
  const done = progress.filter((x) => x.done).length;
  const next = nextAchievement(progress);
  const recent = state.history
    .map((v) => ({ v, r: byId.get(v.rivalryId) }))
    .filter((x): x is { v: typeof x.v; r: DebateRivalry } => x.r !== undefined)
    .slice(0, SHOWN);

  return (
    <div class="panels">
      <section class="panel" aria-labelledby="panel-teams">
        <h2 id="panel-teams" class="panel-title">
          {t.teams.title}
        </h2>
        {recent.length === 0 ? (
          <p class="panel-empty">{t.teams.empty}</p>
        ) : (
          <ul class="teams-list">
            {recent.map(({ v, r }, i) => (
              <li key={`${v.rivalryId}-${state.count - i}`}>
                <strong>{r[v.team].name}</strong>
                <span class="teams-versus">
                  {formatText(t.teams.versus, { name: r[v.team === 'a' ? 'b' : 'a'].name })}
                </span>
                {v.percent !== null && <span class="teams-percent">{v.percent} %</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section class="panel" aria-labelledby="panel-profile">
        <h2 id="panel-profile" class="panel-title">
          {t.profile.title}
        </h2>
        <ul class="profile-list">
          <li>{plural(t.profile.count, p.count)}</li>
          <li>
            {p.agreementRate === null
              ? t.profile.agreementUnknown
              : formatText(t.profile.agreement, { percent: p.agreementRate })}
          </li>
          <li>{plural(t.profile.rebels, p.rebels)}</li>
        </ul>
        <a class="panel-link" href={`/hall-of-fame?theme=${hallScope}`}>
          {t.hallLink}
        </a>
      </section>

      <section class="panel panel--achievements" aria-labelledby="panel-achievements">
        <h2 id="panel-achievements" class="panel-title">
          {a.title}
        </h2>
        <p class="achievements-summary">
          <strong>{formatText(a.count, { done, total: progress.length })}</strong>
          {' · '}
          {next
            ? formatText(a.next, { name: next.rule.name, left: next.rule.goal - next.value })
            : a.allDone}
        </p>
        <ul class="achievements-list">
          {progress.map(({ rule, value, done: unlocked }) => (
            <li key={rule.id} class={`achievement${unlocked ? ' is-done' : ''}`}>
              <AchievementIcon svg={rule.svg} class="achievement-icon" />
              <span class="achievement-text">
                <strong class="achievement-name">{rule.name}</strong>
                <span class="achievement-desc">{rule.description}</span>
                {!unlocked && (
                  <span class="achievement-bar" aria-hidden="true">
                    <span style={{ width: `${(value / rule.goal) * 100}%` }} />
                  </span>
                )}
              </span>
              <span class="achievement-progress">
                {unlocked ? (
                  <>
                    <span aria-hidden="true">✓</span>
                    <span class="visually-hidden">{a.unlocked}</span>
                  </>
                ) : (
                  <>
                    <span class="visually-hidden">{a.locked}, </span>
                    {number(value)} / {number(rule.goal)}
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
