import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { a as jsonResponse, n as getVoteService, o as rejectWrite, t as clientIp } from "./runtime_CzUGee_N.mjs";
// src/pages/api/vote.ts
var vote_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var MAX_BODY = 1024;
var POST = async ({ request, clientAddress }) => {
	const rejected = rejectWrite(request);
	if (rejected) return rejected;
	const service = getVoteService();
	if (!service) return jsonResponse({ error: "votes-disabled" }, 503);
	const text = await request.text();
	if (text.length > MAX_BODY) return jsonResponse({ error: "body-too-large" }, 413);
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		return jsonResponse({ error: "invalid-json" }, 400);
	}
	try {
		const result = service.vote(body, clientIp(request, () => clientAddress));
		return jsonResponse(result.body, result.status);
	} catch (error) {
		console.error("[api/vote]", error.message);
		return jsonResponse({ error: "storage-error" }, 500);
	}
};
// \0virtual:astro:page:src/pages/api/vote@_@ts
var page = () => vote_exports;
export { page };
