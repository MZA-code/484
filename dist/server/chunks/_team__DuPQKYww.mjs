import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { a as getSecret, n as rivalries } from "./content_CdF6cTpI.mjs";
import { n as getVoteService } from "./runtime_DeuYaHK-.mjs";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
// src/server/gif-cache.ts
/**
* Cache des GIF : en mémoire, avec sauvegarde dans un fichier JSON pour survivre
* aux redémarrages du serveur (la clé Giphy gratuite est limitée à ~100 appels par heure).
*/
/** Au-delà, on oublie les entrées les plus anciennes. */
var MAX_ENTRIES = 5e3;
function createMemoryCache(now = Date.now) {
	const entries = /* @__PURE__ */ new Map();
	return {
		entries,
		get(key) {
			const entry = entries.get(key);
			if (!entry) return void 0;
			if (entry.expires <= now()) {
				entries.delete(key);
				return;
			}
			return entry.value;
		},
		set(key, value, ttlMs) {
			entries.delete(key);
			entries.set(key, {
				value,
				expires: now() + ttlMs
			});
			while (entries.size > MAX_ENTRIES) {
				const oldest = entries.keys().next().value;
				if (oldest === void 0) break;
				entries.delete(oldest);
			}
		}
	};
}
/**
* Cache mémoire chargé depuis `file` au démarrage, réécrit (au plus toutes les 2 s)
* après chaque ajout. Une erreur de lecture ou d'écriture n'empêche jamais de servir.
*/
function createFileCache(file, now = Date.now) {
	const memory = createMemoryCache(now);
	try {
		const saved = JSON.parse(readFileSync(file, "utf8"));
		for (const [key, entry] of Object.entries(saved)) if (entry.expires > now()) memory.entries.set(key, entry);
	} catch {}
	let timer = null;
	const flush = () => {
		if (timer) clearTimeout(timer);
		timer = null;
		try {
			mkdirSync(dirname(file), { recursive: true });
			const tmp = `${file}.tmp`;
			writeFileSync(tmp, JSON.stringify(Object.fromEntries(memory.entries)));
			renameSync(tmp, file);
		} catch (error) {
			console.warn("[gif-cache] write failed:", error.message);
		}
	};
	const flushPending = () => {
		if (timer) flush();
	};
	process.once("beforeExit", flushPending);
	for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => {
		flushPending();
		process.exit(0);
	});
	return {
		get: memory.get,
		set(key, value, ttlMs) {
			memory.set(key, value, ttlMs);
			timer ??= setTimeout(flush, 300);
		}
	};
}
// src/server/gif-match.ts
/** Minuscules, sans accents ; tout ce qui n'est ni lettre ni chiffre devient une espace. */
function normalizeText(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
var compact = (value) => value.replace(/ /g, "");
/** Le mot-clé apparaît-il en mots entiers dans le texte (« dc » oui dans « dc comics », non dans « dclic ») ? */
function containsWords(haystack, keyword) {
	return ` ${haystack} `.includes(` ${keyword} `);
}
/**
* Vrai si au moins un mot-clé apparaît dans le titre, le slug ou le nom d'auteur.
* Le nom d'auteur s'écrit sans espaces (« lesinconnus ») : il est comparé mots-clés collés.
*/
function matchesKeywords(gif, keywords) {
	const title = normalizeText(gif.title ?? "");
	const slug = normalizeText(gif.slug ?? "");
	const username = compact(normalizeText(gif.username ?? ""));
	return keywords.some((raw) => {
		const keyword = normalizeText(raw);
		if (!keyword) return false;
		return containsWords(title, keyword) || containsWords(slug, keyword) || username !== "" && username.includes(compact(keyword));
	});
}
/** Articles retirés en tête du nom : « Les Jedi » doit accepter un GIF titré « Jedi ». */
var LEADING_ARTICLE = /^(le|la|les|l|un|une|des|du|the)\s+/;
/**
* Mots-clés d'une team : ceux écrits dans `giphyKeywords`, sinon son nom (sans article)
* et sa requête de recherche (souvent le nom anglais : « Darth Vader » pour Dark Vador).
*/
function keywordsFor(team) {
	if (team.giphyKeywords && team.giphyKeywords.length > 0) return [...team.giphyKeywords];
	const name = normalizeText(team.name).replace(LEADING_ARTICLE, "");
	return [...new Set([name, normalizeText(team.giphyQuery)].filter(Boolean))];
}
// src/server/giphy.ts
/**
* Service Giphy côté serveur. La clé API ne quitte jamais le serveur :
* le client ne reçoit que les URL des médias légers (MP4 / WebP).
*
* Ordre de priorité pour une team :
* 1. un des GIF choisis à la main (`giphyIds`), au hasard ;
* 2. sinon, le premier résultat de la recherche `giphyQuery` (`lang=fr`, `rating=g`) qui passe
*    la validation par mots-clés (voir gif-match.ts) et n'a pas été écarté par les visiteurs
*    (« Mauvais GIF ? » trop souvent signalé : on passe automatiquement au suivant) ;
* 3. sinon, null : le navigateur garde le cadre rayé avec le nom.
* Un résultat de recherche non validé n'est jamais renvoyé.
*
* Tout est mis en cache (mémoire + fichier) pour ménager le quota de l'API.
*/
var API = "https://api.giphy.com/v1/gifs";
/** Durées de cache. */
var TTL = {
	curated: 2592e6,
	search: 6048e5,
	/** Recherche sans résultat : on retentera plus tard. */
	empty: 864e5
};
var GiphyError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
		this.name = "GiphyError";
	}
};
/** Extrait les rendus légers d'un objet Giphy ; null si l'un manque. */
function toGif(raw) {
	const video = raw?.images?.fixed_height;
	const still = raw?.images?.fixed_height_still;
	if (!raw?.id || !video?.mp4 || !video.webp || !still?.url) return null;
	return {
		id: raw.id,
		mp4: video.mp4,
		webp: video.webp,
		still: still.url,
		width: Number(video.width) || 0,
		height: Number(video.height) || 0
	};
}
/**
* Disjoncteur : après un « quota dépassé » (429), on n'appelle plus Giphy pendant ce délai.
* Les cartes gardent leur cadre rayé, sans attendre un refus à chaque GIF.
*/
var QUOTA_PAUSE_MS = 9e5;
function createGiphyService({ apiKey, cache, fetch: doFetch = fetch, random = Math.random, now = Date.now }) {
	let pausedUntil = 0;
	const inFlight = /* @__PURE__ */ new Map();
	async function call(path, params) {
		if (now() < pausedUntil) throw new GiphyError(429, "Giphy quota exceeded (paused)");
		const url = new URL(`${API}${path}`);
		url.search = new URLSearchParams({
			api_key: apiKey,
			...params
		}).toString();
		const response = await doFetch(url, { headers: { accept: "application/json" } });
		if (response.status === 429) pausedUntil = now() + QUOTA_PAUSE_MS;
		if (!response.ok) throw new GiphyError(response.status, `Giphy responded ${response.status}`);
		return response.json();
	}
	function cached(key, ttl, load) {
		const hit = cache.get(key);
		if (hit !== void 0) return Promise.resolve(hit);
		const pending = inFlight.get(key);
		if (pending) return pending;
		const promise = load().then((value) => {
			cache.set(key, value, ttl(value));
			return value;
		}).finally(() => inFlight.delete(key));
		inFlight.set(key, promise);
		return promise;
	}
	function byId(id) {
		return cached(`id:${id}`, (gif) => gif ? TTL.curated : TTL.empty, async () => {
			return toGif((await call(`/${encodeURIComponent(id)}`, {})).data);
		});
	}
	/** Les premiers résultats de la recherche qui passent la validation par mots-clés. */
	function candidates(query, keywords) {
		return cached(`s:${query.trim().toLowerCase()}|k:${[...keywords].sort().join(",").toLowerCase()}`, (list) => list.length > 0 ? TTL.search : TTL.empty, async () => {
			const body = await call("/search", {
				q: query,
				limit: String(25),
				rating: "g",
				lang: "fr"
			});
			const list = [];
			for (const raw of body.data ?? []) {
				if (list.length >= 5) break;
				if (!matchesKeywords(raw, keywords)) continue;
				const gif = toGif(raw);
				if (gif) list.push(gif);
			}
			return list;
		});
	}
	return { 
	/**
	* GIF d'une team : un des GIF choisis, sinon le premier résultat de recherche validé qui
	* n'est pas dans `rejected` (GIF trop signalés), sinon null.
	* Les GIF choisis à la main ne sont jamais écartés automatiquement : c'est à toi d'en juger
	* (ils apparaissent dans `npm run gif-audit`).
	*/
async gifFor(source, rejected = /* @__PURE__ */ new Set()) {
		if (source.giphyIds.length > 0) {
			const id = source.giphyIds[Math.floor(random() * source.giphyIds.length)];
			const gif = await byId(id);
			if (gif) return gif;
		}
		return (await candidates(source.giphyQuery, keywordsFor(source))).find((gif) => !rejected.has(gif.id)) ?? null;
	} };
}
// src/pages/api/gif/[rivalry]/[team].ts
var _team__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var byId = new Map(rivalries.map((r) => [r.id, r]));
var service = null;
function getService(apiKey) {
	service ??= createGiphyService({
		apiKey,
		cache: createFileCache(getSecret("GIF_CACHE_FILE") ?? "data/gif-cache.json")
	});
	return service;
}
var json = (body, status, cacheControl) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": cacheControl
	}
});
/** GIF écartés par les signalements ; une base indisponible n'empêche jamais d'afficher un GIF. */
function rejectedGifs(rivalryId, side) {
	try {
		return getVoteService()?.rejectedGifs(rivalryId, side) ?? /* @__PURE__ */ new Set();
	} catch (error) {
		console.warn("[api/gif] reports unavailable:", error.message);
		return /* @__PURE__ */ new Set();
	}
}
var GET = async ({ params }) => {
	const rivalry = byId.get(params.rivalry ?? "");
	const side = params.team;
	if (!rivalry || side !== "a" && side !== "b") return json({ error: "unknown-team" }, 404, "public, max-age=3600");
	const team = rivalry[side];
	const apiKey = getSecret("GIPHY_API_KEY");
	if (!apiKey) return json({ error: "giphy-not-configured" }, 503, "no-store");
	try {
		const gif = await getService(apiKey).gifFor(team, rejectedGifs(rivalry.id, side));
		if (!gif) return json(null, 200, "public, max-age=3600");
		return json(gif, 200, `public, max-age=${team.giphyIds.length === 1 && team.giphyIds[0] === gif.id ? 86400 : 3600}`);
	} catch (error) {
		const status = error instanceof GiphyError ? error.status : 0;
		console.warn(`[api/gif] ${rivalry.id}/${side}: Giphy failure (${status || "network"})`);
		return json({ error: "giphy-unavailable" }, 502, "no-store");
	}
};
// \0virtual:astro:page:src/pages/api/gif/[rivalry]/[team]@_@ts
var page = () => _team__exports;
export { page };
