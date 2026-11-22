import { t as getSecret } from "./server_Lg2WpWrd.mjs";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
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
/** Mots trop vagues pour valider un GIF à eux seuls. */
var VAGUE_WORDS = /* @__PURE__ */ new Set([
	"the",
	"and",
	"with",
	"from",
	"that",
	"this",
	"your",
	"dans",
	"pour",
	"avec",
	"film",
	"movie",
	"show",
	"series",
	"cartoon",
	"anime",
	"funny",
	"meme",
	"reaction",
	"scene",
	"cute",
	"animated"
]);
/**
* Mots significatifs d'une requête (4 lettres ou plus, hors mots vagues) : la validation
* « mot à mot », pour les teams qui sont des idées (« contrôler la météo » → « weather control »)
* plutôt que des noms propres, dont Giphy ne reprend jamais la phrase exacte.
*/
function queryWords(query) {
	const words = normalizeText(query).split(" ").filter((w) => w.length >= 4 && !VAGUE_WORDS.has(w));
	return [...new Set(words)];
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
* 2. sinon, un résultat de la recherche `giphyQuery` (`lang=fr`, `rating=g`) validé :
*    d'abord ceux qui contiennent un mot-clé entier (nom de la team, requête, `giphyKeywords`),
*    puis, sans `giphyKeywords`, ceux qui contiennent un mot significatif de la requête
*    (voir gif-match.ts). Un GIF trop signalé (« Mauvais GIF ? ») est remplacé par le suivant ;
* 3. sinon, le GIF d'ambiance de la catégorie (ses `giphyIds`, ou sa recherche `giphyQuery`) :
*    un GIF générique (« difficult choice » pour les dilemmes), jamais présenté comme la team ;
* 4. sinon, null : le navigateur garde le cadre rayé avec le nom.
* Un résultat de recherche de team non validé n'est jamais renvoyé.
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
	const gif = {
		id: raw.id,
		mp4: video.mp4,
		webp: video.webp,
		still: still.url,
		width: Number(video.width) || 0,
		height: Number(video.height) || 0
	};
	const small = raw.images?.fixed_height_small;
	const smallStill = raw.images?.fixed_height_small_still;
	if (small?.mp4 && small.webp && smallStill?.url) gif.small = {
		mp4: small.mp4,
		webp: small.webp,
		still: smallStill.url
	};
	return gif;
}
/** Version légère d'un GIF (vignette) : le petit rendu s'il existe, sinon le rendu normal. */
function thumbnailOf(gif) {
	return {
		id: gif.id,
		...gif.small ?? {
			mp4: gif.mp4,
			webp: gif.webp,
			still: gif.still
		}
	};
}
/**
* Disjoncteur : après un « quota dépassé » (429), on n'appelle plus Giphy pendant ce délai.
* Les cartes gardent leur cadre rayé, sans attendre un refus à chaque GIF.
*/
var QUOTA_PAUSE_MS = 9e5;
/** Index stable (0 ≤ i < n) tiré d'un texte : même team, même choix. */
function stableIndex(text, n) {
	let hash = 0;
	for (const char of text) hash = hash * 31 + (char.codePointAt(0) ?? 0) >>> 0;
	return n > 0 ? hash % n : 0;
}
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
	async function searchRaw(query) {
		return (await call("/search", {
			q: query,
			limit: String(25),
			rating: "g",
			lang: "fr"
		})).data ?? [];
	}
	/**
	* Les résultats validés de la recherche, les plus sûrs d'abord : mot-clé entier (`keywords`),
	* puis mot significatif de la requête (`words`, vide pour ne pas l'utiliser).
	*/
	function candidates(query, keywords, words) {
		const sorted = (list) => [...list].sort().join(",").toLowerCase();
		const q = query.trim().toLowerCase();
		const previous = cache.get(`s:${q}|k:${sorted(keywords)}`);
		if (Array.isArray(previous) && previous.length > 0) return Promise.resolve(previous);
		const single = cache.get(`q:${q}|k:${sorted(keywords)}`);
		if (single && !Array.isArray(single)) return Promise.resolve([single]);
		return cached(`c:${q}|k:${sorted(keywords)}|w:${sorted(words)}`, (list) => list.length > 0 ? TTL.search : TTL.empty, async () => {
			const results = await searchRaw(query);
			const strict = results.filter((raw) => matchesKeywords(raw, keywords));
			const loose = results.filter((raw) => !strict.includes(raw) && matchesKeywords(raw, words));
			return [...strict, ...loose].map((raw) => toGif(raw)).filter((gif) => gif !== null).slice(0, 5);
		});
	}
	/** GIF d'ambiance d'une catégorie (recherche générique choisie par nous : premiers résultats). */
	function moodGifs(query) {
		return cached(`m:${query.trim().toLowerCase()}`, (list) => list.length > 0 ? TTL.search : TTL.empty, async () => (await searchRaw(query)).map((raw) => toGif(raw)).filter((gif) => gif !== null).slice(0, 5));
	}
	const pick = (list) => list[Math.floor(random() * list.length)];
	return {
		/** GIF d'ambiance d'une catégorie (vignette de l'accueil) : choisi à la main, sinon le premier trouvé. */
		async categoryGif(mood) {
			const curated = pick(mood.giphyIds ?? []);
			if (curated) {
				const gif = await byId(curated);
				if (gif) return gif;
			}
			return (await moodGifs(mood.giphyQuery))[0] ?? null;
		},
		/**
		* GIF d'une team : un des GIF choisis, sinon le premier résultat de recherche validé qui
		* n'est pas dans `rejected` (GIF trop signalés), sinon null.
		* Les GIF choisis à la main ne sont jamais écartés automatiquement : c'est à toi d'en juger
		* (ils apparaissent dans `npm run gif-audit`).
		*/
		async gifFor(source, rejected = /* @__PURE__ */ new Set()) {
			const curated = pick(source.giphyIds);
			if (curated) {
				const gif = await byId(curated);
				if (gif) return gif;
			}
			const words = source.giphyKeywords?.length ? [] : queryWords(source.giphyQuery);
			const found = (await candidates(source.giphyQuery, keywordsFor(source), words)).find((gif) => !rejected.has(gif.id));
			if (found) return found;
			const fallback = source.fallback;
			if (!fallback) return null;
			const mood = pick(fallback.giphyIds ?? []);
			if (mood) {
				const gif = await byId(mood);
				if (gif) return gif;
			}
			const moods = (await moodGifs(fallback.giphyQuery)).filter((gif) => !rejected.has(gif.id));
			return moods[stableIndex(source.name, moods.length)] ?? null;
		}
	};
}
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
// src/server/giphy-runtime.ts
/**
* Instance unique du service Giphy pour le serveur Astro, partagée par toutes les routes :
* un seul cache en mémoire, un seul fichier `data/gif-cache.json`.
*/
var service = null;
/** null si la clé Giphy n'est pas configurée. */
function getGiphyService() {
	const apiKey = getSecret("GIPHY_API_KEY");
	if (!apiKey) return null;
	service ??= createGiphyService({
		apiKey,
		cache: createFileCache(getSecret("GIF_CACHE_FILE") ?? "data/gif-cache.json")
	});
	return service;
}
var gifJson = (body, status, cacheControl) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": cacheControl
	}
});
export { thumbnailOf as i, gifJson as n, GiphyError as r, getGiphyService as t };
