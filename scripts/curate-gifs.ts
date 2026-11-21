/**
 * Outil de curation des GIF.
 *
 * Pour chaque prétendant sans `giphyIds`, propose 6 GIF Giphy dans une page HTML locale.
 * On coche ses préférés (on peut aussi relancer une recherche avec d'autres mots),
 * puis « Enregistrer » réécrit `content/contenders.json`.
 *
 *   npm run curate                       les 25 premiers prétendants sans GIF choisi
 *   npm run curate -- --theme robots     un seul thème
 *   npm run curate -- --limit 50         plus de prétendants (attention au quota Giphy)
 *   npm run curate -- --all              y compris ceux qui ont déjà des GIF choisis
 *
 * Il faut une clé dans `.env` : GIPHY_API_KEY=…  (clé gratuite : ~100 appels par heure,
 * une recherche = un appel).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage } from 'node:http';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { format, resolveConfig } from 'prettier';
import { parseContent } from '../src/data/parse';
import { toGif, type Gif } from '../src/server/giphy';

const CONTENDERS_FILE = new URL('../content/contenders.json', import.meta.url);
const UI_FILE = new URL('../content/ui-texts.fr.json', import.meta.url);
const PER_CONTENDER = 6;

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

const { values: args } = parseArgs({
  options: {
    theme: { type: 'string' },
    limit: { type: 'string', default: '25' },
    all: { type: 'boolean', default: false },
    port: { type: 'string', default: '4843' },
  },
});

interface RawContender {
  id: string;
  theme: string;
  name: string;
  origin: string;
  giphyIds: string[];
  giphyQuery: string;
}

const readRaw = () =>
  JSON.parse(readFileSync(CONTENDERS_FILE, 'utf8')) as { contenders: RawContender[] };

// ─── Giphy ──────────────────────────────────────────────────────────────────

async function search(query: string): Promise<Gif[]> {
  const url = new URL('https://api.giphy.com/v1/gifs/search');
  url.search = new URLSearchParams({
    api_key: apiKey as string,
    q: query,
    limit: String(PER_CONTENDER),
    rating: 'g',
    lang: 'en',
  }).toString();
  const response = await fetch(url);
  if (response.status === 429)
    throw new Error('Quota Giphy atteint (429). Réessaie dans une heure.');
  if (!response.ok) throw new Error(`Giphy a répondu ${response.status}`);
  const body = (await response.json()) as { data?: unknown[] };
  return (body.data ?? [])
    .map((d) => toGif(d as Parameters<typeof toGif>[0]))
    .filter((g) => g !== null);
}

// ─── Sélection des prétendants ──────────────────────────────────────────────

const targets = readRaw()
  .contenders.filter((c) => !args.theme || c.theme === args.theme)
  .filter((c) => args.all || c.giphyIds.length === 0)
  .slice(0, Number(args.limit));

if (targets.length === 0) {
  console.log('Rien à curer : tous les prétendants sélectionnés ont déjà des GIF choisis.');
  process.exit(0);
}

console.log(`Recherche de ${PER_CONTENDER} GIF pour ${targets.length} prétendant(s)…`);
const results = new Map<string, Gif[]>();
for (const contender of targets) {
  try {
    results.set(contender.id, await search(contender.giphyQuery));
    process.stdout.write('.');
  } catch (error) {
    console.error(`\n${(error as Error).message}`);
    break;
  }
}
console.log(`\n${results.size} prétendant(s) prêts.`);

// ─── Enregistrement ─────────────────────────────────────────────────────────

interface SavePayload {
  picks: Record<string, string[]>;
  queries: Record<string, string>;
}

async function save({ picks, queries }: SavePayload): Promise<string> {
  const raw = readRaw() as { contenders: RawContender[] } & Record<string, unknown>;
  let picked = 0;
  for (const contender of raw.contenders) {
    const ids = picks[contender.id];
    if (ids && ids.length > 0) {
      contender.giphyIds = ids;
      picked++;
    }
    const query = queries[contender.id]?.trim();
    if (query) contender.giphyQuery = query;
  }
  // On valide avant d'écrire : le fichier ne peut pas devenir invalide.
  parseContent(raw, JSON.parse(readFileSync(UI_FILE, 'utf8')));
  // Même mise en forme que le reste du dépôt (configuration Prettier du projet).
  const path = fileURLToPath(CONTENDERS_FILE);
  const options = (await resolveConfig(path)) ?? {};
  const text = await format(JSON.stringify(raw), { ...options, filepath: path });
  writeFileSync(CONTENDERS_FILE, text);
  return `${picked} prétendant(s) enregistrés dans content/contenders.json.`;
}

// ─── Page HTML ──────────────────────────────────────────────────────────────

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function tiles(contenderId: string, gifs: Gif[], chosen: readonly string[]): string {
  if (gifs.length === 0) return '<p class="none">Aucun résultat. Essaie d’autres mots.</p>';
  return gifs
    .map(
      (g) => `<label class="tile">
        <input type="checkbox" name="${escape(contenderId)}" value="${escape(g.id)}" ${chosen.includes(g.id) ? 'checked' : ''}>
        <video src="${escape(g.mp4)}" autoplay muted loop playsinline></video>
      </label>`,
    )
    .join('');
}

function page(): string {
  const byId = new Map(readRaw().contenders.map((c) => [c.id, c]));
  const sections = [...results]
    .map(([id, gifs]) => {
      const c = byId.get(id) as RawContender;
      return `<section data-id="${escape(id)}">
        <h2>${escape(c.name)} <small>${escape(c.origin)}</small></h2>
        <form class="research"><input name="q" value="${escape(c.giphyQuery)}" aria-label="Recherche Giphy"><button>Rechercher</button></form>
        <div class="grid">${tiles(id, gifs, c.giphyIds)}</div>
      </section>`;
    })
    .join('');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Curation des GIF · 484</title>
  <style>
    body{margin:0;padding:24px 24px 96px;background:#121212;color:#f5f1e8;font:15px system-ui,sans-serif}
    h1{margin:0 0 8px}p.help{color:#cfcac0;margin:0 0 24px}
    section{margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #333}
    h2{margin:0 0 8px;font-size:20px}h2 small{color:#cfcac0;font-weight:400;font-size:14px}
    .research{display:flex;gap:8px;margin-bottom:12px}.research input{flex:1;max-width:420px;padding:8px;background:#1c1c1c;color:inherit;border:1px solid #444}
    button{padding:8px 14px;background:#f5f1e8;color:#121212;border:0;font-weight:700;cursor:pointer}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
    .tile{position:relative;display:block;aspect-ratio:16/9;cursor:pointer;outline:4px solid transparent}
    .tile:has(input:checked){outline-color:#ffd23f}
    .tile input{position:absolute;top:8px;left:8px;width:22px;height:22px;z-index:1}
    .tile video{width:100%;height:100%;object-fit:cover;display:block}
    .bar{position:fixed;inset:auto 0 0 0;display:flex;gap:16px;align-items:center;padding:14px 24px;background:#ffd23f;color:#121212;font-weight:700}
    .none{color:#cfcac0}
  </style></head><body>
  <h1>Curation des GIF</h1>
  <p class="help">Coche les GIF à garder (plusieurs possibles : le site en tire un au hasard). Un prétendant sans case cochée n’est pas modifié. Une nouvelle recherche remplace la requête de secours si tu enregistres.</p>
  ${sections}
  <div class="bar"><button id="save">Enregistrer dans contenders.json</button><span id="status"></span></div>
  <script>
    const queries = {};
    document.querySelectorAll('.research').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const section = form.closest('section');
        const id = section.dataset.id;
        const q = form.q.value.trim();
        const res = await fetch('/search?id=' + encodeURIComponent(id) + '&q=' + encodeURIComponent(q));
        if (!res.ok) { alert(await res.text()); return; }
        section.querySelector('.grid').innerHTML = await res.text();
        queries[id] = q;
      });
    });
    document.getElementById('save').addEventListener('click', async () => {
      const picks = {};
      document.querySelectorAll('input[type=checkbox]:checked').forEach((box) => {
        (picks[box.name] ??= []).push(box.value);
      });
      const res = await fetch('/save', { method: 'POST', body: JSON.stringify({ picks, queries }) });
      document.getElementById('status').textContent = await res.text();
    });
  </script></body></html>`;
}

// ─── Serveur local ──────────────────────────────────────────────────────────

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
    } else if (req.method === 'GET' && url.pathname === '/search') {
      const id = url.searchParams.get('id') ?? '';
      const gifs = await search(url.searchParams.get('q') ?? '');
      results.set(id, gifs);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(tiles(id, gifs, []));
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
server.listen(Number(args.port), '127.0.0.1', () => {
  console.log(`Ouvre http://localhost:${args.port} — Ctrl+C pour arrêter.`);
});
