import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories, r as rivalries } from "./server_Pw9WUbLS.mjs";
import { a as teamGifPlan, n as gifJson, r as giphyOffline, t as getGiphyKey } from "./giphy-runtime_BT3SDcU-.mjs";
import { n as getVoteService } from "./runtime_B1erQhpJ.mjs";
// src/lib/giphy.ts
/** Index stable (0 ≤ i < n) tiré d'un texte : même team, même choix. */
function stableIndex(text, n) {
	let hash = 0;
	for (const char of text) hash = hash * 31 + (char.codePointAt(0) ?? 0) >>> 0;
	return n > 0 ? hash % n : 0;
}
// src/server/gif-placeholder.ts
var WIDTH = 356;
var HEIGHT = 200;
/** Teintes de fond, tirées de façon stable d'après la team. */
var HUES = [
	210,
	280,
	330,
	20,
	50,
	140,
	180
];
var escapeXml = (text) => text.replace(/[<>&"']/g, (c) => `&#${c.codePointAt(0) ?? 0};`);
function placeholderGif(name, key) {
	const hue = HUES[stableIndex(key, HUES.length)] ?? 210;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs><pattern id="s" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="hsl(${hue} 45% 22%)"/></pattern></defs>
<rect width="100%" height="100%" fill="hsl(${hue} 45% 16%)"/><rect width="100%" height="100%" fill="url(#s)"/>
<text x="50%" y="44%" text-anchor="middle" font-family="monospace" font-size="15" fill="hsl(${hue} 70% 75%)">GIF (dev, sans Giphy)</text>
<text x="50%" y="60%" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#f5f1e8">${escapeXml(name)}</text>
</svg>`;
	const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
	return {
		id: `dev-${key}`,
		mp4: "",
		webp: src,
		still: src,
		width: WIDTH,
		height: HEIGHT
	};
}
// src/pages/api/gif/[rivalry]/[team].ts
var _team__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var byId = new Map(rivalries.map((r) => [r.id, r]));
/** GIF d'ambiance de chaque catégorie, en dernier recours. */
var moodOf = new Map(categories.map((c) => [c.id, {
	giphyIds: c.giphyIds,
	giphyQuery: c.giphyQuery
}]));
/** GIF écartés par les signalements ; une base indisponible n'empêche jamais d'afficher un GIF. */
function rejectedGifs(rivalryId, side) {
	try {
		return getVoteService()?.rejectedGifs(rivalryId, side) ?? /* @__PURE__ */ new Set();
	} catch (error) {
		console.warn("[api/gif] reports unavailable:", error.message);
		return /* @__PURE__ */ new Set();
	}
}
var GET = ({ params }) => {
	const rivalry = byId.get(params.rivalry ?? "");
	const side = params.team;
	if (!rivalry || side !== "a" && side !== "b") return gifJson({ error: "unknown-team" }, 404, "public, max-age=3600");
	const { plan, maxAge } = teamGifPlan(rivalry[side], {
		apiKey: getGiphyKey(),
		mood: moodOf.get(rivalry.category),
		rejected: rejectedGifs(rivalry.id, side)
	});
	if (!plan && giphyOffline()) {
		const gif = placeholderGif(rivalry[side].name, `${rivalry.id}-${side}`);
		return gifJson({
			kind: "gif",
			gif
		}, 200, "no-store");
	}
	if (!plan) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	return gifJson(plan, 200, `public, max-age=${maxAge}`);
};
// \0virtual:astro:page:src/pages/api/gif/[rivalry]/[team]@_@ts
var page = () => _team__exports;
export { page };
