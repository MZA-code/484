import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories } from "./server_ClkvM-mp.mjs";
import { i as moodPlan, n as gifJson, t as getGiphyKey } from "./giphy-runtime_CdlWz9Fl.mjs";
// src/pages/api/category-gif/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var moodOf = new Map(categories.map((c) => [c.id, {
	giphyIds: c.giphyIds,
	giphyQuery: c.giphyQuery
}]));
var GET = ({ params }) => {
	const mood = moodOf.get(params.id ?? "");
	if (!mood) return gifJson({ error: "unknown-category" }, 404, "public, max-age=3600");
	const key = getGiphyKey();
	if (!key) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	const plan = {
		kind: "giphy",
		key,
		...moodPlan(mood)
	};
	return gifJson(plan, 200, "public, max-age=86400");
};
// \0virtual:astro:page:src/pages/api/category-gif/[id]@_@ts
var page = () => _id__exports;
export { page };
