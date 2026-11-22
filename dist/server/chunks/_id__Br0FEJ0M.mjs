import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { n as categories } from "./server_L0l8KlBq.mjs";
import { i as thumbnailOf, n as gifJson, r as GiphyError, t as getGiphyService } from "./giphy-runtime_C4pQdgPb.mjs";
// src/pages/api/category-gif/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var moodOf = new Map(categories.map((c) => [c.id, {
	giphyIds: c.giphyIds,
	giphyQuery: c.giphyQuery
}]));
var GET = async ({ params }) => {
	const mood = moodOf.get(params.id ?? "");
	if (!mood) return gifJson({ error: "unknown-category" }, 404, "public, max-age=3600");
	const giphy = getGiphyService();
	if (!giphy) return gifJson({ error: "giphy-not-configured" }, 503, "no-store");
	try {
		const gif = await giphy.categoryGif(mood);
		return gifJson(gif ? thumbnailOf(gif) : null, 200, "public, max-age=86400");
	} catch (error) {
		const status = error instanceof GiphyError ? error.status : 0;
		console.warn(`[api/category-gif] ${params.id}: Giphy failure (${status || "network"})`);
		return gifJson({ error: "giphy-unavailable" }, 502, "no-store");
	}
};
// \0virtual:astro:page:src/pages/api/category-gif/[id]@_@ts
var page = () => _id__exports;
export { page };
