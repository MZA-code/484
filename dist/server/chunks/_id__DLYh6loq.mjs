import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { a as universes, i as ui, n as categories } from "./server_CgEm2LZG.mjs";
import { t as placeholderGif } from "./gif-placeholder_Dn6FuSqm.mjs";
import { i as moodPlan, n as gifJson, r as giphyOffline, t as getGiphyKey } from "./giphy-runtime_CKMRDkG-.mjs";
// src/pages/api/finish-gif/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
/** Recherche des écrans de fin sans GIF propre (univers, « Tout mélangé », catégorie sans `finish`). */
var GENERIC_QUERY = "victory dance";
var finishOf = new Map([
	["mix", {
		label: ui.home.mixedTheme.label,
		giphyQuery: GENERIC_QUERY
	}],
	...universes.map((u) => [u.id, {
		label: u.label,
		giphyQuery: GENERIC_QUERY
	}]),
	...categories.map((c) => [c.id, {
		label: c.label,
		giphyQuery: c.finish?.giphyQuery ?? GENERIC_QUERY,
		...c.finish?.giphyIds ? { giphyIds: c.finish.giphyIds } : {}
	}])
]);
var GET = ({ params }) => {
	const finish = finishOf.get(params.id ?? "");
	if (!finish) return gifJson({ error: "unknown-category" }, 404, "public, max-age=3600");
	if (giphyOffline()) {
		const gif = placeholderGif(finish.label, `finish-${params.id ?? ""}`);
		return gifJson({
			kind: "gif",
			gif
		}, 200, "no-store");
	}
	const key = getGiphyKey();
	if (!key) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	const plan = {
		kind: "giphy",
		key,
		...moodPlan(finish)
	};
	return gifJson(plan, 200, "public, max-age=86400");
};
// \0virtual:astro:page:src/pages/api/finish-gif/[id]@_@ts
var page = () => _id__exports;
export { page };
