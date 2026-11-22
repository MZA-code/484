import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { t as getSecret } from "./server_COcyA0ZK.mjs";
import { a as jsonResponse, i as isAdminRequest, n as getVoteService, o as rejectWrite, t as clientIp } from "./runtime_CzUGee_N.mjs";
// src/pages/api/gif-report.ts
var gif_report_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var MAX_BODY = 512;
var POST = async ({ request, clientAddress }) => {
	const rejected = rejectWrite(request);
	if (rejected) return rejected;
	const service = getVoteService();
	if (!service) return jsonResponse({ error: "reports-disabled" }, 503);
	const text = await request.text();
	if (text.length > MAX_BODY) return jsonResponse({ error: "body-too-large" }, 413);
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		return jsonResponse({ error: "invalid-json" }, 400);
	}
	try {
		const result = service.reportGif(body, clientIp(request, () => clientAddress), isAdminRequest(request));
		return jsonResponse(result.body, result.status);
	} catch (error) {
		console.error("[api/gif-report]", error.message);
		return jsonResponse({ error: "storage-error" }, 500);
	}
};
var GET = ({ request }) => {
	const service = getVoteService();
	if (!service) return jsonResponse({ error: "reports-disabled" }, 503);
	const result = service.gifReports(request.headers.get("authorization"), getSecret("GIF_REPORT_TOKEN"));
	return jsonResponse(result.body, result.status);
};
// \0virtual:astro:page:src/pages/api/gif-report@_@ts
var page = () => gif_report_exports;
export { page };
