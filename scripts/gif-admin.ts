/**
 * Page d'admin des GIF, en local uniquement : http://localhost:4850 (rien n'est mis en ligne).
 *
 * Toutes les teams, filtrables (sans GIF choisi, signalées, œuvres françaises…) ; pour chacune :
 * les GIF choisis à la main (retirer d'un clic), une recherche Giphy (ajouter d'un clic), des
 * liens à coller (Tenor, Giphy, image du web ou du poste) et les réglages de la recherche
 * automatique du site. Chaque changement est enregistré aussitôt dans content/rivalries.json.
 * Filtre « Accueil » : les vignettes des catégories (GIF d'ambiance de l'accueil). Un GIF choisi
 * pour chacune = un seul appel à Giphy pour tout l'accueil (clé beta, D45).
 * Le bouton « Publier » commite ces fichiers et les pousse sur GitHub (branche main).
 *
 *   npm run gif-admin                 ouvre la page dans le navigateur
 *   npm run gif-admin -- --no-open    sans ouvrir le navigateur
 *   npm run gif-admin -- --port 4851  un autre port
 *
 * Clé Giphy : GIPHY_API_KEY du .env local, une clé de dev à part de celle du site en ligne
 * (son quota n'est partagé qu'avec `npm run dev`). Une recherche = un appel ; les GIF déjà choisis
 * s'affichent sans appel à l'API. Le compteur des recherches de l'heure est gardé dans
 * data/gif-admin-quota.json : il survit à un redémarrage de la page.
 * Signalements des anciens « Mauvais GIF ? » : data/signalements-en-ligne.json, s'il existe.
 */
import { exec } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { keywordsFor, matchesKeywords, queryWords, type GifText } from '../src/lib/gif-match';
import { toGif } from '../src/lib/giphy';
import { teamImage, tenorGif } from '../src/server/gif-links';
import {
  changeTeam,
  copyChosen,
  git,
  handPickedIds,
  keepRefusedLinks,
  readRaw,
  teamsOf,
  twinsOf,
  uncommittedImages,
  writeRaw,
  type RawFile,
  type RawTeam,
  type TeamChange,
  type TeamRef,
} from './lib/curation';
import { isFrenchWork } from './lib/french-works';
import { importTeamImage } from './lib/team-images';

const { values: args } = parseArgs({
  options: {
    port: { type: 'string', default: '4850' },
    'no-open': { type: 'boolean', default: false },
  },
});

try {
  process.loadEnvFile('.env');
} catch {
  // Pas de .env : les variables peuvent venir de l'environnement.
}

const API_KEY = process.env.GIPHY_API_KEY ?? '';
const PAGE = new URL('./gif-admin.html', import.meta.url);
const PUBLIC_DIR = new URL('../public/', import.meta.url);
const QUOTA_FILE = fileURLToPath(new URL('../data/gif-admin-quota.json', import.meta.url));
const REPORTS_FILE = fileURLToPath(new URL('../data/signalements-en-ligne.json', import.meta.url));
const RIVALRIES_PATH = 'content/rivalries.json';
const IMAGES_PATH = 'public/images/teams';
/** Résultats par recherche : de quoi choisir sans multiplier les appels. */
const PER_SEARCH = 25;
/** Quota de la clé Giphy gratuite (appels par heure). */
const HOURLY_QUOTA = 100;
const HOUR = 3_600_000;
/**
 * Pause minimale après un refus de Giphy : quand nos propres recherches n'expliquent pas le
 * blocage (`npm run dev` puise dans le même quota), on réessaie au bout de ce délai.
 */
const MIN_PAUSE = 5 * 60_000;

// ─── Signalements archivés ──────────────────────────────────────────────────

interface ReportRow {
  rivalryId: string;
  team: 'a' | 'b';
  gifId: string;
  reports: number;
}

/** Signalements par team (« rivalité/a ») puis par GIF. */
function archivedReports(): Map<string, Map<string, number>> {
  const byTeam = new Map<string, Map<string, number>>();
  if (!existsSync(REPORTS_FILE)) return byTeam;
  const { reports } = JSON.parse(readFileSync(REPORTS_FILE, 'utf8')) as { reports: ReportRow[] };
  for (const row of reports) {
    const key = `${row.rivalryId}/${row.team}`;
    const gifs = byTeam.get(key) ?? new Map<string, number>();
    gifs.set(row.gifId, (gifs.get(row.gifId) ?? 0) + row.reports);
    byTeam.set(key, gifs);
  }
  return byTeam;
}
const reports = archivedReports();

// ─── Données envoyées à la page ─────────────────────────────────────────────

interface Media {
  /** Identifiant (Giphy), lien Tenor ou chemin d'image : ce qu'on renvoie pour le retirer. */
  value: string;
  kind: 'giphy' | 'tenor' | 'image';
  mp4?: string | undefined;
  img?: string | undefined;
}

/** Aperçu d'un GIF Giphy à partir de son identifiant : adresse de média, sans appel à l'API. */
const giphyMedia = (id: string): Media => ({
  value: id,
  kind: 'giphy',
  mp4: `https://media.giphy.com/media/${id}/200.mp4`,
  img: `https://media.giphy.com/media/${id}/200_s.gif`,
});

function chosenMedia(team: RawTeam): Media[] {
  return [
    ...team.giphyIds.map(giphyMedia),
    ...(team.gifUrls ?? []).map((url): Media => ({
      value: url,
      kind: 'tenor',
      mp4: tenorGif(url)?.mp4,
    })),
    ...(team.images ?? []).map((path): Media => ({
      value: path,
      kind: 'image',
      img: teamImage(path)?.webp,
    })),
  ];
}

function teamView(ref: TeamRef, all: readonly TeamRef[]) {
  const { team } = ref;
  const reported = reports.get(ref.key);
  return {
    kind: 'team' as const,
    key: ref.key,
    rivalryId: ref.rivalryId,
    side: ref.side,
    category: ref.category,
    name: team.name,
    origin: team.origin,
    line: team.line ?? '',
    opponent: ref.opponent,
    giphyQuery: team.giphyQuery,
    giphyKeywords: team.giphyKeywords ?? null,
    defaultKeywords: keywordsFor({ name: team.name, giphyQuery: team.giphyQuery }),
    chosen: chosenMedia(team),
    curated: handPickedIds(team).length > 0,
    french: isFrenchWork(ref.category, team.origin),
    reports: reported ? [...reported.values()].reduce((a, b) => a + b, 0) : 0,
    reportedGifs: reported ? Object.fromEntries(reported) : {},
    /** La même team dans d'autres duels : mêmes GIF choisis. */
    twins: twinsOf(ref, all).map((t) => ({
      key: t.key,
      opponent: t.opponent,
      category: t.category,
    })),
  };
}

// ─── Vignettes de l'accueil (GIF d'ambiance des catégories) ────────────────

interface RawCategory {
  id: string;
  label: string;
  giphyQuery: string;
  giphyIds?: string[];
}

const CATEGORY_PREFIX = 'categorie:';
const categoriesOf = (raw: RawFile) => raw.categories as RawCategory[];

/** Une catégorie, sous la même forme qu'une team, pour la même fiche dans la page. */
function categoryView(c: RawCategory) {
  const ids = c.giphyIds ?? [];
  return {
    kind: 'category' as const,
    key: `${CATEGORY_PREFIX}${c.id}`,
    rivalryId: '',
    side: '',
    category: c.id,
    name: c.label,
    origin: '',
    line: '',
    opponent: '',
    giphyQuery: c.giphyQuery,
    giphyKeywords: null,
    defaultKeywords: [],
    chosen: ids.map(giphyMedia),
    curated: ids.length > 0,
    french: false,
    reports: 0,
    reportedGifs: {},
    twins: [],
  };
}

function findCategory(raw: RawFile, key: string): RawCategory {
  const category = categoriesOf(raw).find((c) => `${CATEGORY_PREFIX}${c.id}` === key);
  if (!category) throw new HttpError(404, `Catégorie inconnue : ${key}`);
  return category;
}

const GIPHY_ID = /^[A-Za-z0-9]{1,64}$/;

/** Vignette d'une catégorie : GIF Giphy choisis à la main et recherche de secours seulement. */
async function saveCategory(key: string, change: TeamChange) {
  const raw = readRaw();
  const category = findCategory(raw, key);
  if (change.giphyIds) {
    const ids = [...new Set(change.giphyIds.filter((id) => GIPHY_ID.test(id)))];
    if (ids.length) category.giphyIds = ids;
    else delete category.giphyIds;
  }
  const query = change.giphyQuery?.trim();
  if (query) category.giphyQuery = query;
  await writeRaw(raw);
  return { team: categoryView(category), twins: [], problems: [] };
}

function allData() {
  const raw = readRaw();
  const categories = categoriesOf(raw).map((c) => ({ id: c.id, label: c.label }));
  const all = teamsOf(raw);
  return {
    categories,
    teams: [...categoriesOf(raw).map(categoryView), ...all.map((t) => teamView(t, all))],
    hasKey: API_KEY !== '',
  };
}

// ─── Giphy ──────────────────────────────────────────────────────────────────

/**
 * Heures des recherches de la dernière heure (le quota de Giphy est glissant), et heure avant
 * laquelle on ne rappelle pas Giphy après un refus. Gardé sur le disque : un redémarrage de la
 * page ne remet pas le compteur à zéro.
 */
interface QuotaState {
  calls: number[];
  blockedUntil: number;
}
const quotaState = loadQuota();

function loadQuota(): QuotaState {
  try {
    const saved = JSON.parse(readFileSync(QUOTA_FILE, 'utf8')) as Partial<QuotaState>;
    return {
      calls: Array.isArray(saved.calls) ? saved.calls.filter((t) => typeof t === 'number') : [],
      blockedUntil: Number(saved.blockedUntil) || 0,
    };
  } catch {
    return { calls: [], blockedUntil: 0 };
  }
}

function saveQuota() {
  try {
    mkdirSync(dirname(QUOTA_FILE), { recursive: true });
    writeFileSync(QUOTA_FILE, JSON.stringify(quotaState));
  } catch {
    // Pas d'écriture possible : le compteur repartira de zéro au prochain lancement.
  }
}

function quota() {
  const now = Date.now();
  quotaState.calls = quotaState.calls.filter((t) => t > now - HOUR);
  const oldest = quotaState.calls[0];
  return {
    used: quotaState.calls.length,
    limit: HOURLY_QUOTA,
    /** Quand la plus ancienne recherche de l'heure sort du compte. */
    nextFreeAt: oldest === undefined ? null : oldest + HOUR,
    /** Heures des recherches de l'heure : la page fait avancer le compteur toute seule. */
    calls: [...quotaState.calls],
    /** Giphy a refusé : pas de nouvelle recherche avant cette heure (estimation). */
    blockedUntil: quotaState.blockedUntil > now ? quotaState.blockedUntil : null,
  };
}

/**
 * Giphy a refusé. Si nos recherches remplissent le quota, on attend que la plus ancienne sorte
 * du compte ; sinon le blocage vient d'ailleurs (même clé), et on réessaie dans quelques minutes.
 */
function blockAfterRefusal() {
  const { used, limit, nextFreeAt } = quota();
  const now = Date.now();
  quotaState.blockedUntil =
    used >= limit && nextFreeAt ? Math.max(nextFreeAt, now + 60_000) : now + MIN_PAUSE;
  saveQuota();
}

const QUOTA_MESSAGE =
  'Quota Giphy atteint (100 recherches par heure). Les GIF déjà choisis et les liens collés marchent toujours.';

/** Résultats de la session, par recherche : revenir sur une team ne coûte rien. */
const searchCache = new Map<string, unknown>();

async function search(query: string, offset: number, team: RawTeam | undefined, force = false) {
  const cacheKey = `${query}\n${offset}`;
  let body = searchCache.get(cacheKey) as { data?: (GifText & { id: string })[] } | undefined;
  if (!body) {
    if (!API_KEY) throw new HttpError(400, 'Pas de clé Giphy : ajoute GIPHY_API_KEY dans .env.');
    // Pendant la pause, on ne rappelle pas Giphy (sauf « Réessayer maintenant »).
    if (quota().blockedUntil && !force) throw new HttpError(429, QUOTA_MESSAGE);
    const url = new URL('https://api.giphy.com/v1/gifs/search');
    url.search = new URLSearchParams({
      api_key: API_KEY,
      q: query,
      limit: String(PER_SEARCH),
      offset: String(offset),
      rating: 'g',
      lang: 'fr',
    }).toString();
    const response = await fetch(url);
    if (response.status === 429) {
      blockAfterRefusal();
      throw new HttpError(429, QUOTA_MESSAGE);
    }
    quotaState.calls.push(Date.now());
    quotaState.blockedUntil = 0;
    saveQuota();
    if (!response.ok) throw new HttpError(502, `Giphy a répondu ${response.status}.`);
    body = (await response.json()) as { data?: (GifText & { id: string })[] };
    searchCache.set(cacheKey, body);
  }
  // Comment le site jugerait chaque GIF s'il n'était pas choisi à la main.
  const strict = team ? keywordsFor(team) : [];
  const loose = team && !team.giphyKeywords?.length ? queryWords(team.giphyQuery) : [];
  const results = (body.data ?? []).flatMap((raw) => {
    const gif = toGif(raw as Parameters<typeof toGif>[0]);
    if (!gif) return [];
    const text = { title: raw.title, slug: raw.slug, username: raw.username };
    const match = matchesKeywords(text, strict)
      ? 'exact'
      : matchesKeywords(text, loose)
        ? 'near'
        : 'no';
    return [
      { id: gif.id, mp4: gif.mp4, img: gif.still, title: raw.title || raw.slug || gif.id, match },
    ];
  });
  return { results, quota: quota() };
}

// ─── Enregistrement ─────────────────────────────────────────────────────────

function findTeam(raw: RawFile, key: string): TeamRef {
  const ref = teamsOf(raw).find((t) => t.key === key);
  if (!ref) throw new HttpError(404, `Team inconnue : ${key}`);
  return ref;
}

async function saveTeam(key: string, change: TeamChange) {
  const raw = readRaw();
  const all = teamsOf(raw);
  const ref = findTeam(raw, key);
  const problems = await changeTeam(ref.team, change, (source, name) =>
    importTeamImage(source, name),
  );
  // La même team dans d'autres duels reçoit les mêmes GIF : rien à choisir deux fois.
  const twins = twinsOf(ref, all);
  twins.forEach((twin) => copyChosen(ref.team, twin.team));
  await writeRaw(raw);
  keepRefusedLinks(ref.team.name, problems);
  return {
    team: teamView(ref, all),
    twins: twins.map((t) => teamView(t, all)),
    problems,
  };
}

// ─── Publication ────────────────────────────────────────────────────────────

/**
 * Teams (« rivalité/a ») et vignettes (« categorie:x ») dont les GIF ou la recherche diffèrent de
 * la dernière version commitée.
 */
function changedTeams(): string[] {
  let committed: RawFile;
  try {
    committed = JSON.parse(git(['show', `HEAD:${RIVALRIES_PATH}`])) as RawFile;
  } catch {
    return [];
  }
  const before = new Map(teamsOf(committed).map((t) => [t.key, t.team]));
  const fingerprint = (t: RawTeam | undefined) =>
    t ? JSON.stringify([t.giphyIds, t.gifUrls, t.images, t.giphyQuery, t.giphyKeywords]) : '';
  const now = readRaw();
  const teams = teamsOf(now)
    .filter((t) => fingerprint(t.team) !== fingerprint(before.get(t.key)))
    .map((t) => t.key);
  const beforeCategories = new Map(categoriesOf(committed).map((c) => [c.id, c]));
  const print = (c: RawCategory | undefined) =>
    c ? JSON.stringify([c.giphyIds, c.giphyQuery]) : '';
  const categories = categoriesOf(now)
    .filter((c) => print(c) !== print(beforeCategories.get(c.id)))
    .map((c) => `${CATEGORY_PREFIX}${c.id}`);
  return [...categories, ...teams];
}

function publishStatus() {
  let branch = '';
  try {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  } catch {
    // Pas de git : pas de publication possible.
  }
  return { branch, changed: changedTeams(), images: uncommittedImages() };
}

function publish() {
  const status = publishStatus();
  if (status.branch !== 'main') {
    throw new HttpError(
      409,
      `Publication impossible depuis la branche « ${status.branch || '?'} » : passe sur main (git checkout main).`,
    );
  }
  if (status.changed.length === 0 && status.images.length === 0) {
    throw new HttpError(409, 'Rien à publier.');
  }
  const homes = status.changed.filter((k) => k.startsWith(CATEGORY_PREFIX)).length;
  const teams = status.changed.length - homes;
  const parts = [
    ...(teams ? [`${teams} team${teams > 1 ? 's' : ''}`] : []),
    ...(homes ? [`${homes} vignette${homes > 1 ? 's' : ''} de l’accueil`] : []),
  ];
  const message = `content: GIF choisis à la main (${parts.join(', ') || 'images'})`;
  git(['add', '--', RIVALRIES_PATH, IMAGES_PATH]);
  // Seulement ces fichiers, même si d'autres changements sont prêts dans git.
  git(['commit', '-m', message, '--', RIVALRIES_PATH, IMAGES_PATH]);
  try {
    git(['push', 'origin', 'main']);
  } catch (error) {
    throw new HttpError(
      502,
      `Commit fait, mais l’envoi sur GitHub a échoué : ${gitError(error)} Dans un terminal : git pull, puis git push.`,
    );
  }
  return { message, ...publishStatus() };
}

const gitError = (error: unknown) =>
  String((error as { stderr?: string }).stderr || (error as Error).message)
    .trim()
    .split('\n')
    .slice(-2)
    .join(' ');

// ─── Serveur ────────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const json = (res: ServerResponse, status: number, body: unknown) =>
  res
    .writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
    .end(JSON.stringify(body));

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    // Défense contre un autre site ouvert dans le navigateur qui viserait ce port.
    const origin = req.headers.origin;
    if (req.method === 'POST' && origin && new URL(origin).host !== req.headers.host) {
      throw new HttpError(403, 'Origine refusée.');
    }
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(readFileSync(PAGE));
    } else if (req.method === 'GET' && url.pathname.startsWith('/images/teams/')) {
      // Aperçu des images rangées sur le site (public/images/teams/).
      const file = new URL(`.${url.pathname}`, PUBLIC_DIR);
      if (!existsSync(file)) throw new HttpError(404, 'Image introuvable.');
      res.writeHead(200, { 'content-type': 'image/webp' }).end(readFileSync(file));
    } else if (req.method === 'GET' && url.pathname === '/api/data') {
      json(res, 200, { ...allData(), quota: quota(), publish: publishStatus() });
    } else if (req.method === 'GET' && url.pathname === '/api/search') {
      const q = (url.searchParams.get('q') ?? '').trim();
      if (!q) throw new HttpError(400, 'Recherche vide.');
      const key = url.searchParams.get('key') ?? '';
      const team = key ? teamsOf().find((t) => t.key === key)?.team : undefined;
      const offset = Number(url.searchParams.get('offset')) || 0;
      json(res, 200, await search(q, offset, team, url.searchParams.get('force') === '1'));
    } else if (req.method === 'POST' && url.pathname === '/api/team') {
      const { key, change } = JSON.parse(await readBody(req)) as {
        key: string;
        change: TeamChange;
      };
      const saved = key.startsWith(CATEGORY_PREFIX)
        ? await saveCategory(key, change)
        : await saveTeam(key, change);
      json(res, 200, { ...saved, publish: publishStatus() });
    } else if (req.method === 'POST' && url.pathname === '/api/publish') {
      json(res, 200, publish());
    } else {
      throw new HttpError(404, 'Introuvable.');
    }
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error(error);
    // Un refus de Giphy renvoie aussi le compteur, pour le compte à rebours de la page.
    json(res, status, {
      error: (error as Error).message,
      ...(status === 429 ? { quota: quota() } : {}),
    });
  }
});

const port = Number(args.port);
// Écoute uniquement sur ce PC : la page n'est jamais accessible depuis le réseau.
server.listen(port, '127.0.0.1', () => {
  const address = `http://localhost:${port}`;
  console.log(`Admin des GIF : ${address} — Ctrl+C pour arrêter.`);
  if (!API_KEY) console.log('⚠ Pas de clé Giphy dans .env : la recherche est désactivée.');
  if (!args['no-open']) {
    const opener =
      process.platform === 'win32'
        ? `start "" "${address}"`
        : process.platform === 'darwin'
          ? `open ${address}`
          : `xdg-open ${address}`;
    exec(opener);
  }
});
