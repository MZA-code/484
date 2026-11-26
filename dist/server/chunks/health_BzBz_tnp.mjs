import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { t as getSecret } from "./server_DrxCRZVd.mjs";
import { i as jsonResponse, r as ipDiagnostic, s as sameToken } from "./runtime_pa2uKs1e.mjs";
// src/pages/api/health.ts
var health_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
/**
* GET /api/health → { status, time }
* GET /api/health?ip avec « Authorization: Bearer <GIF_REPORT_TOKEN> » → en plus, l'adresse IP
* reçue et celle retenue pour la limite de débit (diagnostic du proxy de l'hébergeur).
*/
var GET = ({ request, url, clientAddress }) => {
	const body = {
		status: "ok",
		time: (/* @__PURE__ */ new Date()).toISOString()
	};
	const token = getSecret("GIF_REPORT_TOKEN");
	const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
	if (url.searchParams.has("ip") && token && sameToken(given, token)) body.ip = ipDiagnostic(request, () => clientAddress);
	return jsonResponse(body, 200);
};
// \0virtual:astro:page:src/pages/api/health@_@ts
var page = () => health_exports;
export { page };
