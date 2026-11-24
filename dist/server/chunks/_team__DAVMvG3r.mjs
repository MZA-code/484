import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories, r as rivalries } from "./server_2GPV2Xjl.mjs";
import { a as teamGifPlan, n as gifJson, r as giphyOffline, t as getGiphyKey } from "./giphy-runtime_CEkXOoUo.mjs";
import { t as placeholderGif } from "./gif-placeholder_Dn6FuSqm.mjs";
import { n as getVoteService } from "./runtime_BEEFhGQ9.mjs";
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
