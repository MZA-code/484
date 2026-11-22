import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { a as jsonResponse, n as getVoteService, s as HALL_TTL_MS } from "./runtime_CbfwZ_XD.mjs";
// src/pages/api/hall-of-fame.ts
var hall_of_fame_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = ({ url }) => {
	const service = getVoteService();
	if (!service) return jsonResponse({ error: "votes-disabled" }, 503);
	try {
		const result = service.hallOfFame(url.searchParams.get("theme"));
		const cache = result.status === 200 ? `public, max-age=${HALL_TTL_MS / 1e3}` : "no-store";
		return jsonResponse(result.body, result.status, cache);
	} catch (error) {
		console.error("[api/hall-of-fame]", error.message);
		return jsonResponse({ error: "storage-error" }, 500);
	}
};
// \0virtual:astro:page:src/pages/api/hall-of-fame@_@ts
var page = () => hall_of_fame_exports;
export { page };
