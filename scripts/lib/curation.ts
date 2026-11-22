/**
 * Page locale de curation des GIF, partagée par `npm run curate` et `npm run gif-audit`.
 *
 * Pour chaque team ciblée : 6 propositions Giphy (recherche `lang=fr`), cochables. Chaque
 * proposition indique si elle passe la validation par mots-clés du site. On peut relancer une
 * recherche et modifier les mots-clés ; « Enregistrer » réécrit `content/rivalries.json`
 * (validé avant écriture, mis en forme par Prettier).
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage } from 'node:http';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { parseRivalries } from '../../src/data/parse';
import {
  canonicalTenorUrl,
  giphyIdFromUrl,
  isTeamImage,
  teamImage,
  teamImageId,
  tenorGif,
  tenorGifId,
} from '../../src/server/gif-links';
import { keywordsFor, matchesKeywords, queryWords, type GifText } from '../../src/server/gif-match';
import { toGif, type Gif } from '../../src/server/giphy';
import { importTeamImage, isImageSource } from './team-images';

const RIVALRIES_FILE = new URL('../../content/rivalries.json', import.meta.url);
/** Liens collés mais non utilisables (ni Tenor ni Giphy) : gardés ici pour ne rien perdre (ignoré par git). */
const REFUSED_FILE = new URL('../../liens-refuses.txt', import.meta.url);
const PUBLIC_DIR = new URL('../../public/', import.meta.url);
export const PER_TEAM = 6;

// ─── Fichier des rivalités ──────────────────────────────────────────────────

export interface RawTeam {
  name: string;
  origin: string;
  giphyIds: string[];
  giphyQuery: string;
  giphyKeywords?: string[];
  /** Liens Tenor choisis à la main. */
  gifUrls?: string[];
  /** Images rangées sur le site (`/images/teams/…webp`). */
  images?: string[];
}

/**
 * Identifiants des GIF choisis à la main : Giphy, liens Tenor (« tenor… ») et images du site (« img… »).
 */
export function handPickedIds(team: RawTeam): string[] {
  return [
    ...team.giphyIds,
    ...(team.gifUrls ?? []).map((url) => tenorGifId(url) ?? url),
    ...(team.images ?? []).map((path) => teamImageId(path) ?? path),
  ];
}

/** La team a-t-elle au moins un GIF choisi à la main ? */
export const isCurated = (team: RawTeam) => handPickedIds(team).length > 0;

export interface PastedLinks {
  /** Liens Tenor, sous leur forme canonique. */
  tenor: string[];
  /** Identifiants Giphy. */
  giphy: string[];
  /** Images déjà rangées sur le site (`/images/teams/…`). */
  images: string[];
  /** Images à importer : liens web ou fichiers du poste. */
  toImport: string[];
  /** Lignes non reconnues. */
  invalid: string[];
}

/**
 * Lit les liens collés, un par ligne : Tenor → forme canonique, Giphy → identifiant,
 * image du site → gardée, autre lien web ou fichier du poste → image à importer.
 */
export function readLinks(text: string): PastedLinks {
  const result: PastedLinks = { tenor: [], giphy: [], images: [], toImport: [], invalid: [] };
  for (const raw of text.split(/\r?\n/)) {
    // « Copier en tant que chemin » de Windows ajoute des guillemets.
    const line = raw.trim().replace(/^"(.*)"$/, '$1');
    if (!line) continue;
    const tenor = canonicalTenorUrl(line);
    const giphy = tenor ? null : giphyIdFromUrl(line);
    if (tenor) result.tenor.push(tenor);
    else if (giphy) result.giphy.push(giphy);
    else if (isTeamImage(line)) result.images.push(line);
    else if (isImageSource(line)) result.toImport.push(line);
    else result.invalid.push(line);
  }
  const unique = (list: string[]) => [...new Set(list)];
  return {
    tenor: unique(result.tenor),
    giphy: unique(result.giphy),
    images: unique(result.images),
    toImport: unique(result.toImport),
    invalid: result.invalid,
  };
}

interface RawRivalry {
  id: string;
  category: string;
  a: RawTeam;
  b: RawTeam;
}

type RawFile = { rivalries: RawRivalry[] } & Record<string, unknown>;

export const readRaw = () => JSON.parse(readFileSync(RIVALRIES_FILE, 'utf8')) as RawFile;

/** Une team : « rivalité/a » ou « rivalité/b ». */
export interface TeamRef {
  key: string;
  category: string;
  team: RawTeam;
  opponent: string;
}

export function teamsOf(file: RawFile = readRaw()): TeamRef[] {
  return file.rivalries.flatMap((r) => [
    { key: `${r.id}/a`, category: r.category, team: r.a, opponent: r.b.name },
    { key: `${r.id}/b`, category: r.category, team: r.b, opponent: r.a.name },
  ]);
}

/** Clé Giphy depuis `.env` ou l'environnement ; quitte avec un message clair si elle manque. */
export function requireApiKey(): string {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Pas de .env : la clé peut venir de l'environnement.
  }
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    console.error('GIPHY_API_KEY manquante. Copie .env.example en .env et renseigne ta clé Giphy.');
    process.exit(1);
  }
  return apiKey;
}

// ─── Giphy ──────────────────────────────────────────────────────────────────

interface Proposal {
  gif: Gif;
  text: GifText;
}

async function search(apiKey: string, query: string): Promise<Proposal[]> {
  const url = new URL('https://api.giphy.com/v1/gifs/search');
  url.search = new URLSearchParams({
    api_key: apiKey,
    q: query,
    limit: String(PER_TEAM),
    rating: 'g',
    lang: 'fr',
  }).toString();
  const response = await fetch(url);
  if (response.status === 429) {
    throw new Error('Quota Giphy atteint (429). Réessaie dans une heure.');
  }
  if (!response.ok) throw new Error(`Giphy a répondu ${response.status}`);
  const body = (await response.json()) as { data?: (GifText & { id: string })[] };
  return (body.data ?? []).flatMap((raw) => {
    const gif = toGif(raw as Parameters<typeof toGif>[0]);
    return gif ? [{ gif, text: { title: raw.title, slug: raw.slug, username: raw.username } }] : [];
  });
}

// ─── Enregistrement ─────────────────────────────────────────────────────────

interface SavePayload {
  picks: Record<string, string[]>;
  queries: Record<string, string>;
  /** Mots-clés séparés par des virgules ; vide = retour aux mots-clés par défaut. */
  keywords: Record<string, string>;
  /** Liens Tenor ou Giphy, images (lien ou fichier) collés, un par ligne. */
  links?: Record<string, string>;
}

export const splitKeywords = (value: string) =>
  value
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

async function save({ picks, queries, keywords, links = {} }: SavePayload): Promise<string> {
  const raw = readRaw();
  let picked = 0;
  const problems: string[] = [];
  for (const { key, team } of teamsOf(raw)) {
    const ids = picks[key];
    const before = JSON.stringify(handPickedIds(team));
    if (ids && ids.length > 0) team.giphyIds = ids;
    if (key in links) {
      const { tenor, giphy, images, toImport, invalid } = readLinks(links[key] ?? '');
      invalid.forEach((line) => problems.push(`${team.name} : ${line} (lien non reconnu)`));
      for (const source of toImport) {
        try {
          images.push(await importTeamImage(source, team.name));
        } catch (error) {
          problems.push(`${team.name} : ${source} (${(error as Error).message})`);
        }
      }
      if (tenor.length > 0) team.gifUrls = tenor;
      else delete team.gifUrls;
      const kept = [...new Set(images)];
      if (kept.length > 0) team.images = kept;
      else delete team.images;
      team.giphyIds = [...new Set([...team.giphyIds, ...giphy])];
    }
    if (JSON.stringify(handPickedIds(team)) !== before) picked++;
    const query = queries[key]?.trim();
    if (query) team.giphyQuery = query;
    if (key in keywords) {
      const list = splitKeywords(keywords[key] ?? '');
      if (list.length > 0) team.giphyKeywords = list;
      else delete team.giphyKeywords;
    }
  }
  // On valide avant d'écrire : le fichier ne peut pas devenir invalide.
  parseRivalries(raw);
  // Même mise en forme que le reste du dépôt (configuration Prettier du projet).
  const path = fileURLToPath(RIVALRIES_FILE);
  const options = (await resolveConfig(path)) ?? {};
  const text = await format(JSON.stringify(raw), { ...options, filepath: path });
  writeFileSync(RIVALRIES_FILE, text);
  const saved = `${picked} team(s) enregistrée(s) dans content/rivalries.json.`;
  if (problems.length === 0) return saved;
  // Les liens refusés ne sont pas perdus : ils restent dans la page et sont recopiés dans un fichier.
  const day = new Date().toISOString().slice(0, 10);
  appendFileSync(REFUSED_FILE, problems.map((line) => `${day} · ${line}\n`).join(''));
  return `${saved} ⚠ ${problems.length} lien(s) non enregistré(s), gardés dans liens-refuses.txt : ${problems.join(' · ')}`;
}

// ─── Page HTML ──────────────────────────────────────────────────────────────

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Informations affichées en plus pour une team (signalements, raison de sa présence…). */
export interface TargetNote {
  /** Courte étiquette sous le titre (« 3 signalements », « œuvre française »). */
  badges: string[];
  /** GIF signalés par les visiteurs, marqués dans la grille. */
  reportedGifs?: ReadonlyMap<string, number> | undefined;
}

interface MatchSource {
  name: string;
  giphyQuery: string;
  giphyKeywords?: string[] | undefined;
}

/** Comment le site jugerait ce GIF : mot-clé entier, mot de la requête, ou refusé. */
function matchLabel(text: GifText, source: MatchSource): string {
  if (matchesKeywords(text, keywordsFor(source))) return '<span class="ok">✓ exact</span>';
  const words = source.giphyKeywords?.length ? [] : queryWords(source.giphyQuery);
  if (matchesKeywords(text, words)) return '<span class="near">≈ mot à mot</span>';
  return '<span class="ko">✗ refusé</span>';
}

/** Aperçu des liens Tenor et des images déjà choisis (ce que le site affichera). */
function linkPreviews(team: RawTeam): string {
  const videos = (team.gifUrls ?? [])
    .map((url) => tenorGif(url))
    .filter((gif) => gif !== null)
    .map(
      (gif) =>
        `<figure><video src="${escape(gif.mp4)}" autoplay muted loop playsinline></video><figcaption>Lien Tenor choisi</figcaption></figure>`,
    );
  const images = (team.images ?? [])
    .map((path) => teamImage(path))
    .filter((gif) => gif !== null)
    .map(
      (gif) =>
        `<figure><img src="${escape(gif.webp)}" alt=""><figcaption>Image du site</figcaption></figure>`,
    );
  const items = [...videos, ...images];
  return items.length > 0 ? `<div class="previews">${items.join('')}</div>` : '';
}

function tiles(
  teamKey: string,
  proposals: Proposal[],
  chosen: readonly string[],
  source: MatchSource,
  reported: ReadonlyMap<string, number> | undefined,
): string {
  if (proposals.length === 0) return '<p class="none">Aucun résultat. Essaie d’autres mots.</p>';
  return proposals
    .map(({ gif, text }) => {
      const reports = reported?.get(gif.id) ?? 0;
      const caption = [
        matchLabel(text, source),
        reports ? `<span class="ko">⚠ signalé ${reports}×</span>` : '',
        `<span class="title">${escape(text.title || text.slug || gif.id)}</span>`,
      ].join(' ');
      return `<label class="tile">
        <input type="checkbox" name="${escape(teamKey)}" value="${escape(gif.id)}" ${chosen.includes(gif.id) ? 'checked' : ''}>
        <video src="${escape(gif.mp4)}" autoplay muted loop playsinline></video>
        <span class="caption">${caption}</span>
      </label>`;
    })
    .join('');
}

export interface CurationOptions {
  apiKey: string;
  targets: TeamRef[];
  port: number;
  title: string;
  intro: string;
  notes?: ReadonlyMap<string, TargetNote>;
}

/** Lance les recherches, puis sert la page de curation sur http://localhost:<port>. */
export async function runCuration({ apiKey, targets, port, title, intro, notes }: CurationOptions) {
  console.log(`Recherche de ${PER_TEAM} GIF pour ${targets.length} team(s)…`);
  const results = new Map<string, Proposal[]>();
  for (const target of targets) {
    try {
      results.set(target.key, await search(apiKey, target.team.giphyQuery));
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n${(error as Error).message}`);
      break;
    }
  }
  console.log(`\n${results.size} team(s) prête(s).`);

  const page = () => {
    const byKey = new Map(teamsOf().map((t) => [t.key, t]));
    const sections = [...results]
      .map(([key, proposals]) => {
        const t = byKey.get(key) as TeamRef;
        const note = notes?.get(key);
        const badges = (note?.badges ?? []).map((b) => `<span class="badge">${escape(b)}</span>`);
        const keywords = keywordsFor(t.team);
        return `<section data-id="${escape(key)}">
        <h2>Team ${escape(t.team.name)} <small>contre ${escape(t.opponent)} · ${escape(t.team.origin)} · ${escape(key)}</small> ${badges.join('')}</h2>
        <form class="research">
          <label>Recherche <input name="q" value="${escape(t.team.giphyQuery)}"></label>
          <label>Mots-clés <input name="kw" value="${escape((t.team.giphyKeywords ?? []).join(', '))}" placeholder="${escape(keywords.join(', '))}"></label>
          <button>Rechercher</button>
        </form>
        <div class="grid">${tiles(key, proposals, t.team.giphyIds, t.team, note?.reportedGifs)}</div>
        <label class="links">Liens Tenor ou Giphy, ou une image (lien d’image ou fichier du poste), un par ligne — clic droit sur l’image, « Copier l’adresse de l’image »
          <textarea data-links="${escape(key)}" rows="2" placeholder="https://media.tenor.com/…/nom.gif">${escape([...(t.team.gifUrls ?? []), ...(t.team.images ?? [])].join('\n'))}</textarea>
        </label>
        ${linkPreviews(t.team)}
      </section>`;
      })
      .join('');
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escape(title)} · 484</title>
  <style>
    body{margin:0;padding:24px 24px 96px;background:#121212;color:#f5f1e8;font:15px system-ui,sans-serif}
    h1{margin:0 0 8px}p.help{color:#cfcac0;margin:0 0 24px;max-width:70ch}
    section{margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #333}
    h2{margin:0 0 8px;font-size:20px}h2 small{color:#cfcac0;font-weight:400;font-size:14px}
    .badge{display:inline-block;margin-left:8px;padding:2px 8px;background:#ff6fa8;color:#121212;font-size:12px;vertical-align:middle}
    .research{display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin-bottom:12px}
    .research label{display:flex;flex-direction:column;gap:4px;color:#cfcac0;font-size:12px}
    .research input{width:300px;padding:8px;background:#1c1c1c;color:#f5f1e8;border:1px solid #444}
    button{padding:8px 14px;background:#f5f1e8;color:#121212;border:0;font-weight:700;cursor:pointer}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
    .tile{position:relative;display:flex;flex-direction:column;gap:4px;cursor:pointer;outline:4px solid transparent}
    .tile:has(input:checked){outline-color:#ffd23f}
    .tile input{position:absolute;top:8px;left:8px;width:22px;height:22px;z-index:1}
    .tile video{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
    .caption{font-size:12px;color:#cfcac0;padding:0 4px 4px}.caption .title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ok{color:#66e08a}.near{color:#ffd23f}.ko{color:#ff5a4e}
    .bar{position:fixed;inset:auto 0 0 0;display:flex;gap:16px;align-items:center;padding:14px 24px;background:#ffd23f;color:#121212;font-weight:700}
    .none{color:#cfcac0}
    .links{display:flex;flex-direction:column;gap:6px;margin-top:14px;color:#cfcac0;font-size:12px}
    .links textarea{width:min(100%,720px);padding:8px;background:#1c1c1c;color:#f5f1e8;border:1px solid #444;font:13px ui-monospace,monospace}
    .previews{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
    .previews figure{margin:0;width:200px;outline:4px solid #ffd23f}.previews video,.previews img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
    .previews figcaption{font-size:12px;color:#cfcac0;padding:4px}
  </style></head><body>
  <h1>${escape(title)}</h1>
  <p class="help">${escape(intro)} Coche les GIF à garder (plusieurs possibles : le site en tire un au hasard) ; une team sans case cochée garde ses GIF actuels. « ✓ exact » et « ≈ mot à mot » : ce GIF serait accepté par la recherche automatique du site (l’exact passe en premier) ; « ✗ refusé » : jamais affiché sans ton choix. Mots-clés vides = valeurs par défaut (en gris).</p>
  ${sections}
  <div class="bar"><button id="save">Enregistrer dans rivalries.json</button><span id="status"></span></div>
  <script>
    const queries = {};
    const keywords = {};
    document.querySelectorAll('.research').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const section = form.closest('section');
        const id = section.dataset.id;
        const q = form.q.value.trim();
        const kw = form.kw.value.trim();
        const res = await fetch('/search?id=' + encodeURIComponent(id) + '&q=' + encodeURIComponent(q) + '&kw=' + encodeURIComponent(kw));
        if (!res.ok) { alert(await res.text()); return; }
        section.querySelector('.grid').innerHTML = await res.text();
        queries[id] = q;
        keywords[id] = kw;
      });
    });
    document.getElementById('save').addEventListener('click', async () => {
      const picks = {};
      document.querySelectorAll('input[type=checkbox]:checked').forEach((box) => {
        (picks[box.name] ??= []).push(box.value);
      });
      const links = {};
      document.querySelectorAll('textarea[data-links]').forEach((area) => {
        links[area.dataset.links] = area.value;
      });
      const res = await fetch('/save', { method: 'POST', body: JSON.stringify({ picks, queries, keywords, links }) });
      document.getElementById('status').textContent = await res.text();
    });
  </script></body></html>`;
  };

  const readBody = (req: IncomingMessage) =>
    new Promise<string>((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page());
      } else if (req.method === 'GET' && isTeamImage(url.pathname)) {
        // Aperçu des images importées (public/images/teams/).
        const file = new URL(`.${url.pathname}`, PUBLIC_DIR);
        res.writeHead(200, { 'content-type': 'image/webp' }).end(readFileSync(file));
      } else if (req.method === 'GET' && url.pathname === '/search') {
        const id = url.searchParams.get('id') ?? '';
        const target = teamsOf().find((t) => t.key === id);
        if (!target) throw new Error(`Team inconnue : ${id}`);
        const query = url.searchParams.get('q') || target.team.giphyQuery;
        const typed = splitKeywords(url.searchParams.get('kw') ?? '');
        const source = {
          name: target.team.name,
          giphyQuery: query,
          giphyKeywords: typed.length > 0 ? typed : undefined,
        };
        const proposals = await search(apiKey, query);
        results.set(id, proposals);
        res
          .writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
          .end(tiles(id, proposals, [], source, notes?.get(id)?.reportedGifs));
      } else if (req.method === 'POST' && url.pathname === '/save') {
        const message = await save(JSON.parse(await readBody(req)) as SavePayload);
        console.log(message);
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end(message);
      } else {
        res.writeHead(404).end();
      }
    } catch (error) {
      res
        .writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
        .end((error as Error).message);
    }
  });

  // Écoute uniquement en local : cet outil n'est pas fait pour être exposé.
  server.listen(port, '127.0.0.1', () => {
    console.log(`Ouvre http://localhost:${port} — Ctrl+C pour arrêter.`);
  });
}
