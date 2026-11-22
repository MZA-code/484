import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories, o as tenorGif, r as rivalries } from "./server_Lg2WpWrd.mjs";
import { n as gifJson, r as GiphyError, t as getGiphyService } from "./giphy-runtime_Cvq70K44.mjs";
import { n as getVoteService } from "./runtime_By4MsoVd.mjs";
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
	const links = team.gifUrls ?? [];
	const handPicked = links.length + team.giphyIds.length;
	const maxAge = handPicked === 1 ? 86400 : 3600;
	const pick = Math.floor(Math.random() * handPicked);
	const link = pick < links.length ? tenorGif(links[pick]) : null;
	if (link) return gifJson(link, 200, `public, max-age=${maxAge}`);
	const giphy = getGiphyService();
	if (!giphy) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	try {
		const chosen = team.giphyIds[pick - links.length];
		const giphyIds = chosen ? [chosen] : team.giphyIds;
		const gif = await giphy.gifFor({
			...team,
			giphyIds,
			fallback: moodOf.get(rivalry.category)
		}, rejectedGifs(rivalry.id, side));
		if (!gif) return gifJson(null, 200, "public, max-age=3600");
		return gifJson(gif, 200, `public, max-age=${handPicked > 0 ? maxAge : 3600}`);
	} catch (error) {
		const status = error instanceof GiphyError ? error.status : 0;
		console.warn(`[api/gif] ${rivalry.id}/${side}: Giphy failure (${status || "network"})`);
		return gifJson({ error: "giphy-unavailable" }, 502, "no-store");
	}
};
// \0virtual:astro:page:src/pages/api/gif/[rivalry]/[team]@_@ts
var page = () => _team__exports;
export { page };
