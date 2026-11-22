/**
 * Audit des GIF : quelles teams curer en priorité ?
 *
 * Liste :
 * 1. les teams sans GIF choisi (`giphyIds` vide), les plus signalées (« Mauvais GIF ? ») d'abord ;
 * 2. les teams dont l'origine cite une œuvre française (Giphy les connaît mal) ;
 * 3. en plus, les teams dont un GIF choisi à la main a été signalé.
 * Puis ouvre la page de curation (6 propositions par team) pour les premières de la liste ;
 * « Enregistrer » réécrit `content/rivalries.json` avec tes choix.
 *
 *   npm run gif-audit                                 signalements de la base locale (data/votes.sqlite)
 *   npm run gif-audit -- --reports https://team484.fr  signalements du site en ligne (GIF_REPORT_TOKEN)
 *   npm run gif-audit -- --list                       la liste seule, sans page ni appel à Giphy
 *   npm run gif-audit -- --limit 40                   nombre de teams dans la page (défaut 25)
 *   npm run gif-audit -- --full                       liste aussi toutes les teams sans GIF non signalées
 *
 * Quota Giphy : une team de la page = une recherche (clé gratuite : ~100 par heure).
 */
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { parseArgs } from 'node:util';
import {
  isFrenchWork,
  reportsByTeam,
  sortByReports,
  type ReportRow,
  type TeamReports,
} from './lib/audit';
import { requireApiKey, runCuration, teamsOf, type TargetNote, type TeamRef } from './lib/curation';

const { values: args } = parseArgs({
  options: {
    reports: { type: 'string' },
    db: { type: 'string', default: 'data/votes.sqlite' },
    limit: { type: 'string', default: '25' },
    list: { type: 'boolean', default: false },
    full: { type: 'boolean', default: false },
    port: { type: 'string', default: '4843' },
  },
});

try {
  process.loadEnvFile('.env');
} catch {
  // Pas de .env : les variables peuvent venir de l'environnement.
}

// ─── Signalements ───────────────────────────────────────────────────────────

/** Signalements du site en ligne, via GET /api/gif-report protégé par GIF_REPORT_TOKEN. */
async function remoteReports(site: string): Promise<ReportRow[]> {
  const token = process.env.GIF_REPORT_TOKEN;
  if (!token) {
    throw new Error('GIF_REPORT_TOKEN manquant dans .env (le même que sur le serveur).');
  }
  const response = await fetch(new URL('/api/gif-report', site), {
    headers: { authorization: `Bearer ${token}` },
  });
  if (response.status === 401)
    throw new Error('Jeton refusé : GIF_REPORT_TOKEN diffère du serveur.');
  if (response.status === 404) {
    throw new Error('Liste indisponible : GIF_REPORT_TOKEN n’est pas configuré sur le serveur.');
  }
  if (!response.ok) throw new Error(`Le site a répondu ${response.status}.`);
  return ((await response.json()) as { reports: ReportRow[] }).reports;
}

/** Signalements d'une base SQLite locale (lecture seule). */
function localReports(file: string): ReportRow[] {
  if (!existsSync(file)) return [];
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    return db
      .prepare('SELECT rivalry_id AS rivalryId, team, gif_id AS gifId, reports FROM gif_reports')
      .all() as unknown as ReportRow[];
  } catch {
    // Base antérieure aux signalements : la table n'existe pas encore.
    return [];
  } finally {
    db.close();
  }
}

let rows: ReportRow[];
let source: string;
try {
  if (args.reports) {
    rows = await remoteReports(args.reports);
    source = args.reports;
  } else {
    rows = localReports(args.db);
    source = `${args.db} (base locale ; --reports https://team484.fr pour le site en ligne)`;
  }
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
const reports = reportsByTeam(rows);
const total = (key: string) => reports.get(key)?.total ?? 0;

// ─── Listes ─────────────────────────────────────────────────────────────────

const teams = teamsOf();
const uncurated = sortByReports(
  teams.filter((t) => t.team.giphyIds.length === 0),
  reports,
);
const french = sortByReports(
  teams.filter((t) => isFrenchWork(t.category, t.team.origin)),
  reports,
);
const reportedCurated = sortByReports(
  teams.filter((t) => t.team.giphyIds.some((id) => (reports.get(t.key)?.gifs.get(id) ?? 0) > 0)),
  reports,
);

const line = (t: TeamRef) => {
  const n = total(t.key);
  const flags = [
    n ? `${n} signalement${n > 1 ? 's' : ''}` : '',
    t.team.giphyIds.length ? `${t.team.giphyIds.length} GIF choisi(s)` : 'aucun GIF choisi',
    t.team.giphyKeywords ? `mots-clés : ${t.team.giphyKeywords.join(', ')}` : '',
  ].filter(Boolean);
  return `  ${t.key.padEnd(58)} ${t.team.name} (${t.team.origin}) — ${flags.join(' · ')}`;
};

console.log(`Signalements : ${rows.reduce((s, r) => s + r.reports, 0)} (source : ${source})\n`);

const reportedUncurated = uncurated.filter((t) => total(t.key) > 0);
console.log(
  `1. Teams sans GIF choisi : ${uncurated.length}, dont ${reportedUncurated.length} signalée(s)`,
);
const shown = args.full ? uncurated : reportedUncurated;
shown.forEach((t) => console.log(line(t)));
if (!args.full && uncurated.length > shown.length) {
  console.log(
    `  … et ${uncurated.length - shown.length} autre(s) sans signalement (--full pour tout voir)`,
  );
}

console.log(`\n2. Teams issues d’une œuvre française : ${french.length}`);
french.forEach((t) => console.log(line(t)));

if (reportedCurated.length > 0) {
  console.log(`\n3. Teams dont un GIF choisi à la main a été signalé : ${reportedCurated.length}`);
  reportedCurated.forEach((t) => console.log(line(t)));
}

if (args.list) process.exit(0);

// ─── Page de curation ───────────────────────────────────────────────────────

// Priorité : signalées sans GIF, GIF choisis signalés, œuvres françaises sans GIF, puis le reste.
const order = [
  ...reportedUncurated,
  ...reportedCurated,
  ...french.filter((t) => t.team.giphyIds.length === 0),
  ...french,
  ...uncurated,
];
const seen = new Set<string>();
const targets = order
  .filter((t) => !seen.has(t.key) && seen.add(t.key))
  .slice(0, Number(args.limit));

if (targets.length === 0) {
  console.log('\nRien à curer.');
  process.exit(0);
}

const frenchKeys = new Set(french.map((t) => t.key));
const notes = new Map<string, TargetNote>(
  targets.map((t) => {
    const r: TeamReports | undefined = reports.get(t.key);
    const badges = [
      r ? `${r.total} signalement${r.total > 1 ? 's' : ''}` : '',
      frenchKeys.has(t.key) ? 'œuvre française' : '',
      t.team.giphyIds.length ? `${t.team.giphyIds.length} GIF choisi(s)` : '',
    ].filter(Boolean);
    return [t.key, { badges, reportedGifs: r?.gifs }];
  }),
);

console.log('');
await runCuration({
  apiKey: requireApiKey(),
  targets,
  port: Number(args.port),
  title: 'Audit des GIF',
  intro: `${targets.length} team(s) à vérifier en priorité : signalées par les visiteurs, puis œuvres françaises.`,
  notes,
});
