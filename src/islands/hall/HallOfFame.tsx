/**
 * Hall of Fame des débats : le verdict mondial, filtrable par catégorie (synchronisé avec ?theme=).
 * Les plus votés (podium commenté), les plus serrés, les plus écrasants.
 */
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { UiTexts } from '../../data/schema';
import { teamColors } from '../../lib/color';
import { formatText, plural } from '../../lib/format';
import './hall.css';

const MIXED = 'mix';

interface Ranked {
  id: string;
  aVotes: number;
  bVotes: number;
  total: number;
  aPercent: number;
}

interface Hall {
  category: string;
  totalVotes: number;
  popular: Ranked[];
  closest: Ranked[];
  landslides: Ranked[];
}

export interface HallData {
  /** Filtres proposés : « Tout mélangé » puis les univers. */
  universes: { id: string; label: string }[];
  categories: { id: string; label: string }[];
  rivalries: { id: string; category: string; question: string; a: string; b: string }[];
  mixedLabel: string;
  texts: UiTexts['hallOfFame'];
}

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready'; hall: Hall };

function initialCategory(ids: Set<string>): string {
  const category = new URLSearchParams(window.location.search).get('theme');
  return category && ids.has(category) ? category : MIXED;
}

export default function HallOfFame({ data }: { data: HallData }) {
  const t = data.texts;
  const tabs = useMemo(() => [{ id: MIXED, label: data.mixedLabel }, ...data.universes], [data]);
  const byId = useMemo(() => new Map(data.rivalries.map((r) => [r.id, r])), [data]);
  const labels = useMemo(
    () => new Map([...tabs, ...data.categories].map((x) => [x.id, x.label])),
    [tabs, data],
  );
  const [category, setCategory] = useState(() => initialCategory(new Set(tabs.map((x) => x.id))));
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', category);
    window.history.replaceState(null, '', url);

    let cancelled = false;
    setLoad({ status: 'loading' });
    fetch(`/api/hall-of-fame?theme=${encodeURIComponent(category)}`)
      .then((r) =>
        r.ok ? (r.json() as Promise<Hall>) : Promise.reject(new Error(String(r.status))),
      )
      .then((hall) => !cancelled && setLoad({ status: 'ready', hall }))
      .catch(() => !cancelled && setLoad({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [category]);

  /** Une rivalité : la question, la barre à deux camps et les chiffres. */
  const debate = (r: Ranked) => {
    const rivalry = byId.get(r.id);
    if (!rivalry) return null;
    const [ca, cb] = teamColors(r.id);
    return (
      <>
        <span class="hall-category">{labels.get(rivalry.category)}</span>
        <span class="hall-question">{rivalry.question}</span>
        <span class="hall-bar" aria-hidden="true">
          <span style={{ width: `${r.aPercent}%`, background: ca }} />
          <span style={{ flex: 1, background: cb }} />
        </span>
        <span class="hall-split">
          <span>
            {rivalry.a} · {r.aPercent} %
          </span>
          <span class="hall-votes">{plural(t.votes, r.total)}</span>
          <span>
            {100 - r.aPercent} % · {rivalry.b}
          </span>
        </span>
      </>
    );
  };

  const section = (id: string, title: string, intro: string, list: Ranked[]) => (
    <section class="hall-section" aria-labelledby={id}>
      <h2 id={id} class="hall-title">
        {title}
      </h2>
      <p class="hall-intro">{intro}</p>
      {list.length === 0 ? (
        <p class="hall-status">{t.emptySection}</p>
      ) : (
        <ol class="hall-list">
          {list.map((r) => (
            <li key={r.id} class="hall-row">
              {debate(r)}
            </li>
          ))}
        </ol>
      )}
    </section>
  );

  return (
    <div class="hall">
      <nav class="theme-filter" aria-label={t.filterLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            class="theme-tab"
            aria-pressed={tab.id === category}
            onClick={() => setCategory(tab.id)}
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

            {load.hall.popular.length === 0 ? (
              <p class="hall-status">{t.empty}</p>
            ) : (
              <>
                <section class="hall-section" aria-labelledby="hall-popular">
                  <h2 id="hall-popular" class="hall-title">
                    {t.popularTitle}
                  </h2>
                  <p class="hall-intro">{t.popularIntro}</p>
                  <ol class="podium">
                    {load.hall.popular.slice(0, 3).map((r, i) => (
                      <li key={r.id} class="podium-card pop">
                        <span class="podium-rank">{i + 1}</span>
                        {debate(r)}
                        <span class="podium-quip">{t.podium[i]}</span>
                      </li>
                    ))}
                  </ol>
                  {load.hall.popular.length > 3 && (
                    <ol class="hall-list hall-list--after-podium" start={4}>
                      {load.hall.popular.slice(3).map((r) => (
                        <li key={r.id} class="hall-row">
                          {debate(r)}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
                {section('hall-close', t.closeTitle, t.closeIntro, load.hall.closest)}
                {section(
                  'hall-landslide',
                  t.landslideTitle,
                  t.landslideIntro,
                  load.hall.landslides,
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Question affichée pour une rivalité : la question sur mesure, sinon « Team A ou team B ? ». */
export function questionFor(
  r: { question?: string | undefined; a: { name: string }; b: { name: string } },
  template: string,
): string {
  return r.question ?? formatText(template, { a: r.a.name, b: r.b.name });
}
