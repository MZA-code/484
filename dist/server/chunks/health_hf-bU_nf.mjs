import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
// src/pages/api/health.ts
var health_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = () => new Response(JSON.stringify({
	status: "ok",
	time: (/* @__PURE__ */ new Date()).toISOString()
}), { headers: {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "no-store"
} });
// \0virtual:astro:page:src/pages/api/health@_@ts
var page = () => health_exports;
export { page };
