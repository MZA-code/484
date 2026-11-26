import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { i as placeholdersOff, n as gifJson, o as teamGifPlan, r as giphyOffline, t as getGiphyKey } from "./giphy-runtime_DmJtWuEO.mjs";
import { n as categories, r as rivalries } from "./server_bcRQyk-o.mjs";
import { t as placeholderGif } from "./gif-placeholder_Dn6FuSqm.mjs";
// src/server/team-gif.ts
/**
* Plan du GIF d'une team (« rivalité/a » ou « rivalité/b ») : ce que le navigateur doit afficher
* ou demander à Giphy (voir src/server/gif-plan.ts et src/lib/giphy.ts). Utilisé par
* /api/gif-plans, qui renvoie les plans de plusieurs teams en une seule réponse.
*/
var byId = new Map(rivalries.map((r) => [r.id, r]));
/** GIF d'ambiance de chaque catégorie, en dernier recours. */
var moodOf = new Map(categories.map((c) => [c.id, {
	giphyIds: c.giphyIds,
	giphyQuery: c.giphyQuery
}]));
/** Plan pour une team ; undefined si la team est inconnue. */
function teamPlanFor(gifKey) {
	const [rivalryId, side, ...rest] = gifKey.split("/");
	const rivalry = byId.get(rivalryId ?? "");
	if (!rivalry || rest.length > 0 || side !== "a" && side !== "b") return void 0;
	const { plan, maxAge } = teamGifPlan(rivalry[side], {
		apiKey: getGiphyKey(),
		mood: moodOf.get(rivalry.category)
	});
	if (!plan && giphyOffline() && !placeholdersOff()) return {
		plan: {
			kind: "gif",
			gif: placeholderGif(rivalry[side].name, `${rivalry.id}-${side}`)
		},
		maxAge: 0
	};
	return {
		plan,
		maxAge
	};
}
// src/pages/api/gif-plans.ts
var gif_plans_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
/** Teams par requête au plus (le navigateur en demande 48 : voir PLANS_PER_REQUEST). */
var MAX_TEAMS = 60;
var GET = ({ url }) => {
	const keys = [...new Set((url.searchParams.get("teams") ?? "").split(",").filter(Boolean))];
	if (keys.length === 0 || keys.length > MAX_TEAMS) return gifJson({ error: "bad-teams" }, 400, "no-store");
	const plans = {};
	let maxAge = 86400;
	for (const key of keys) {
		const result = teamPlanFor(key);
		if (!result) continue;
		plans[key] = result.plan;
		maxAge = Math.min(maxAge, result.plan ? result.maxAge : 0);
	}
	return gifJson({ plans }, 200, maxAge > 0 ? `public, max-age=${maxAge}` : "no-store");
};
// \0virtual:astro:page:src/pages/api/gif-plans@_@ts
var page = () => gif_plans_exports;
export { page };
