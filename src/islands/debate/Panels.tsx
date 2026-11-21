/** Les deux panneaux sous le débat : « Tes teams » (derniers choix) et « Ton profil ». */
import { profile, type DebateState } from '../../engine';
import { formatText, plural } from '../../lib/format';
import type { DebateData, DebateRivalry } from './types';

interface Props {
  state: DebateState;
  /** Filtre du Hall of Fame correspondant à la partie : son univers, ou « mix ». */
  hallScope: string;
  byId: ReadonlyMap<string, DebateRivalry>;
  texts: DebateData['texts'];
}

/** Nombre de choix affichés dans « Tes teams ». */
const SHOWN = 5;

export function Panels({ state, hallScope, byId, texts }: Props) {
  const t = texts.debate;
  const p = profile(state);
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
    </div>
  );
}
