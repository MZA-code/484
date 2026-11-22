import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories, r as rivalries } from "./server_D2vEgv0p.mjs";
import { n as gifJson, r as GiphyError, t as getGiphyService } from "./giphy-runtime_DCM8yO5K.mjs";
import { n as getVoteService } from "./runtime_C0TQjExH.mjs";
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
var GET = async ({ params }) => {
	const rivalry = byId.get(params.rivalry ?? "");
	const side = params.team;
	if (!rivalry || side !== "a" && side !== "b") return gifJson({ error: "unknown-team" }, 404, "public, max-age=3600");
	const team = rivalry[side];
	const giphy = getGiphyService();
	if (!giphy) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	try {
		const gif = await giphy.gifFor({
			...team,
			fallback: moodOf.get(rivalry.category)
		}, rejectedGifs(rivalry.id, side));
		if (!gif) return gifJson(null, 200, "public, max-age=3600");
		const maxAge = team.giphyIds.length === 1 && team.giphyIds[0] === gif.id ? 86400 : 3600;
		return gifJson(gif, 200, `public, max-age=${maxAge}`);
	} catch (error) {
		const status = error instanceof GiphyError ? error.status : 0;
		console.warn(`[api/gif] ${rivalry.id}/${side}: Giphy failure (${status || "network"})`);
		return gifJson({ error: "giphy-unavailable" }, 502, "no-store");
	}
};
// \0virtual:astro:page:src/pages/api/gif/[rivalry]/[team]@_@ts
var page = () => _team__exports;
export { page };
