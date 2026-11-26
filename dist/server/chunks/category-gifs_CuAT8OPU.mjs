import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories } from "./server_bcRQyk-o.mjs";
import { a as moodPlan, n as gifJson, t as getGiphyKey } from "./giphy-runtime_DmJtWuEO.mjs";
// src/pages/api/category-gifs.ts
var category_gifs_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = () => {
	const key = getGiphyKey();
	if (!key) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	const body = {
		kind: "giphy",
		key,
		plans: Object.fromEntries(categories.map((c) => [c.id, moodPlan({
			giphyIds: c.giphyIds,
			giphyQuery: c.giphyQuery
		})]))
	};
	return gifJson(body, 200, "public, max-age=86400");
};
// \0virtual:astro:page:src/pages/api/category-gifs@_@ts
var page = () => category_gifs_exports;
export { page };
