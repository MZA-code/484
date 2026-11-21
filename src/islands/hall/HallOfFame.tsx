/**
 * Hall of Fame : classement mondial établi d'après les votes de tous les visiteurs.
 * Filtre par thème (synchronisé avec ?theme=), top 20 avec podium commenté,
 * les mal-aimés et les duels les plus serrés.
 */
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { UiTexts } from '../../data/schema';
import { colorFor } from '../../lib/color';
import { formatText, plural } from '../../lib/format';
import './hall.css';

const MIXED = 'mix';

interface Ranked {
  id: string;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
}

interface CloseDuel {
  aId: string;
  bId: string;
  aWins: number;
  bWins: number;
  total: number;
}

interface Hall {
  theme: string;
  totalVotes: number;
  top: Ranked[];
  flop: Ranked[];
  close: CloseDuel[];
}

export interface HallData {
  themes: { id: string; label: string }[];
  contenders: { id: string; name: string; theme: string }[];
  mixedLabel: string;
  texts: UiTexts['hallOfFame'];
}

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; hall: Hall };

function initialTheme(themeIds: Set<string>): string {
  const theme = new URLSearchParams(window.location.search).get('theme');
  return theme && themeIds.has(theme) ? theme : MIXED;
}

export default function HallOfFame({ data }: { data: HallData }) {
  const t = data.texts;
  const tabs = useMemo(() => [{ id: MIXED, label: data.mixedLabel }, ...data.themes], [data]);
  const names = useMemo(() => new Map(data.contenders.map((c) => [c.id, c])), [data]);
  const labels = useMemo(() => new Map(tabs.map((tab) => [tab.id, tab.label])), [tabs]);
  const [theme, setTheme] = useState(() => initialTheme(new Set(tabs.map((tab) => tab.id))));
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState(null, '', url);

    let cancelled = false;
    setLoad({ status: 'loading' });
    fetch(`/api/hall-of-fame?theme=${encodeURIComponent(theme)}`)
      .then((r) =>
        r.ok ? (r.json() as Promise<Hall>) : Promise.reject(new Error(String(r.status))),
      )
      .then((hall) => !cancelled && setLoad({ status: 'ready', hall }))
      .catch(() => !cancelled && setLoad({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [theme]);

  const name = (id: string) => names.get(id)?.name ?? id;
  const themePrefix = (id: string) => {
    const c = names.get(id);
    return theme === MIXED && c ? `${labels.get(c.theme)} · ` : '';
  };

  const row = (r: Ranked, rank: number) => (
    <li key={r.id} class="hall-row">
      <span class="hall-rank">{rank}</span>
      <span class="hall-swatch" style={{ background: colorFor(r.id) }} aria-hidden="true" />
      <span class="hall-name">
        {name(r.id)}
        {themePrefix(r.id) && <span class="hall-theme">{themePrefix(r.id)}</span>}
      </span>
      <span class="hall-rate">{formatText(t.winRate, { percent: r.winRate })}</span>
      <span class="hall-record">{formatText(t.record, { wins: r.wins, losses: r.losses })}</span>
    </li>
  );

  return (
    <div class="hall">
      <nav class="theme-filter" aria-label={t.filterLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            class="theme-tab"
            aria-pressed={tab.id === theme}
            onClick={() => setTheme(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div aria-live="polite" aria-busy={load.status === 'loading'}>
        {load.status === 'loading' && <p class="hall-status">{t.loading}</p>}
        {load.status === 'error' && <p class="hall-status">{t.error}</p>}
        {load.status === 'ready' && (
          <>
            <p class="hall-total">{plural(t.totalVotes, load.hall.totalVotes)}</p>

            {load.hall.top.length === 0 ? (
              <p class="hall-status">{t.empty}</p>
            ) : (
              <>
                <ol class="podium">
                  {load.hall.top.slice(0, 3).map((r, i) => (
                    <li key={r.id} class="podium-card pop" style={{ '--card': colorFor(r.id) }}>
                      <span class="podium-rank">{i + 1}</span>
                      <span class="podium-name">{name(r.id)}</span>
                      <span class="podium-stats">
                        {formatText(t.winRate, { percent: r.winRate })} ·{' '}
                        {formatText(t.record, { wins: r.wins, losses: r.losses })}
                      </span>
                      <span class="podium-quip">{t.podium[i]}</span>
                    </li>
                  ))}
                </ol>

                {load.hall.top.length > 3 && (
                  <section class="hall-section" aria-labelledby="hall-top">
                    <h2 id="hall-top" class="hall-title">
                      {t.topTitle}
                    </h2>
                    <ol class="hall-list">{load.hall.top.slice(3).map((r, i) => row(r, i + 4))}</ol>
                  </section>
                )}
              </>
            )}

            {load.hall.flop.length > 0 && (
              <section class="hall-section" aria-labelledby="hall-flop">
                <h2 id="hall-flop" class="hall-title">
                  {t.flopTitle}
                </h2>
                <p class="hall-intro">{t.flopIntro}</p>
                <ol class="hall-list">{load.hall.flop.map((r, i) => row(r, i + 1))}</ol>
              </section>
            )}

            <section class="hall-section" aria-labelledby="hall-close">
              <h2 id="hall-close" class="hall-title">
                {t.closeTitle}
              </h2>
              <p class="hall-intro">{t.closeIntro}</p>
              {load.hall.close.length === 0 ? (
                <p class="hall-status">{t.emptyClose}</p>
              ) : (
                <ul class="hall-duels">
                  {load.hall.close.map((d) => (
                    <li key={`${d.aId}|${d.bId}`}>
                      <span class="hall-duel-names">
                        <strong>{name(d.aId)}</strong> {t.versus} <strong>{name(d.bId)}</strong>
                      </span>
                      <span class="hall-duel-score">
                        {d.aWins} – {d.bWins}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
