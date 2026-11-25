import { o as teamImage, s as tenorGif, t as getSecret } from "./server_CAe04_RC.mjs";
import { rmSync } from "node:fs";
// src/lib/gif-match.ts
/** Minuscules, sans accents ; tout ce qui n'est ni lettre ni chiffre devient une espace. */
function normalizeText(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
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
// src/server/gif-plan.ts
var pick = (list, random) => list[Math.floor(random() * list.length)];
/** Le GIF d'ambiance à demander : un choisi à la main tiré au sort, sinon la recherche. */
function moodPlan(mood, random = Math.random) {
	return {
		id: pick(mood.giphyIds ?? [], random),
		query: mood.giphyQuery
	};
}
/**
* Plan pour une team : GIF choisis à la main (liens Tenor, images du site, GIF Giphy) tirés au
* sort ensemble ; sinon la recherche validée, puis le GIF d'ambiance de la catégorie.
*/
function teamGifPlan(team, options) {
	const random = options.random ?? Math.random;
	const direct = [...(team.gifUrls ?? []).map(tenorGif), ...(team.images ?? []).map(teamImage)];
	const handPicked = direct.length + team.giphyIds.length;
	const maxAge = handPicked === 1 ? 86400 : 3600;
	const index = Math.floor(random() * handPicked);
	const ready = index < direct.length ? direct[index] : null;
	if (ready) return {
		plan: {
			kind: "gif",
			gif: ready
		},
		maxAge
	};
	if (!options.apiKey) return {
		plan: null,
		maxAge: 3600
	};
	const words = team.giphyKeywords?.length ? [] : queryWords(team.giphyQuery);
	return {
		plan: {
			kind: "giphy",
			key: options.apiKey,
			name: team.name,
			id: team.giphyIds[index - direct.length],
			query: team.giphyQuery,
			keywords: keywordsFor(team),
			words,
			rejected: [...options.rejected ?? []],
			mood: options.mood ? moodPlan(options.mood, random) : void 0
		},
		maxAge: handPicked > 0 ? maxAge : 3600
	};
}
// src/server/giphy-runtime.ts
/**
* Clé Giphy du site, transmise au navigateur dans les plans de /api/gif et /api/category-gif :
* c'est le navigateur qui appelle Giphy (règle de GIPHY pour le web, voir src/lib/giphy.ts).
*/
var oldCacheRemoved = false;
/**
* Mode développement sans Giphy (`npm run dev:sans-giphy`) : la clé n'est jamais envoyée au
* navigateur, donc aucun appel à l'API Giphy ; les cartes reçoivent un GIF de remplacement.
* Jamais activé en production (la variable n'existe pas dans cPanel).
*/
function giphyOffline() {
	return getSecret("GIPHY_OFFLINE") === "true";
}
/** undefined si la clé Giphy n'est pas configurée, ou en mode sans Giphy. */
function getGiphyKey() {
	if (giphyOffline()) return void 0;
	if (!oldCacheRemoved) {
		oldCacheRemoved = true;
		try {
			rmSync("data/gif-cache.json", { force: true });
		} catch {}
	}
	return getSecret("GIPHY_API_KEY") || void 0;
}
var gifJson = (body, status, cacheControl) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": cacheControl
	}
});
export { teamGifPlan as a, moodPlan as i, gifJson as n, giphyOffline as r, getGiphyKey as t };
