import { t as __exportAll } from "./rolldown-runtime_BJohB4LM.mjs";
import { i as ui, n as categories, r as rivalries, t as getSecret } from "./server_Lg2WpWrd.mjs";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
// src/lib/format.ts
/**
* Remplit les marqueurs `{clé}` d'un texte. Un marqueur sans valeur reste visible,
* pour qu'un oubli se remarque au lieu de disparaître en silence.
*/
function formatText(template, values) {
	return template.replace(/\{(\w+)\}/g, (marker, key) => key in values ? String(values[key]) : marker);
}
// src/lib/color.ts
/** Couleurs des cartes (direction artistique du prototype). */
var CARD_COLORS = [
	"#FFD23F",
	"#FF6FA8",
	"#43C6F0",
	"#66E08A",
	"#FF8A3D",
	"#B69CFF",
	"#F5F1E8",
	"#FF5A4E"
];
/** Hachage FNV-1a 32 bits : rapide, stable d'une version à l'autre. */
function hashString(value) {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
/**
* Brassage final d'un hachage (finaliseur de MurmurHash3) : les bits de poids faible de FNV-1a
* varient trop peu entre deux textes voisins pour choisir une couleur avec un simple modulo.
*/
function mix(hash) {
	let h = hash;
	h ^= h >>> 16;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	h = Math.imul(h, 3266489909);
	h ^= h >>> 16;
	return h >>> 0;
}
/**
* Couleurs des deux teams d'une rivalité : stables, et toujours différentes l'une de l'autre.
* Les 56 paires possibles sont toutes utilisées : B est choisie parmi les 7 couleurs restantes.
*/
function teamColors(rivalryId) {
	const n = CARD_COLORS.length;
	const h = mix(hashString(rivalryId));
	const a = h % n;
	const b = (a + 1 + Math.floor(h / n) % (n - 1)) % n;
	return [CARD_COLORS[a], CARD_COLORS[b]];
}
// src/lib/og-path.ts
/** Image de partage : dimensions et adresse (celle d'un débat, ou l'image générale du site). */
var OG_WIDTH = 1200;
// src/server/og.ts
/**
* Images de partage (Open Graph, 1200 × 630) générées à la demande :
* satori compose la mise en page en SVG, resvg (WebAssembly, sans binaire natif) la convertit en PNG.
*
* - une image par débat : « TEAM A  VS  TEAM B » aux couleurs du jeu ;
* - une image générale pour le reste du site (la phrase de l'accueil).
*
* Chaque image n'est dessinée qu'une fois : elle est rangée sur disque sous une empreinte de sa
* mise en page (un texte modifié donne une nouvelle image), et les plus récentes restent en mémoire.
*/
var INK = "#121212";
var FG = "#F5F1E8";
var MUTED = "#B9B4A8";
var YELLOW = "#FFD23F";
var PINK = "#FF6FA8";
var el = (style, children) => ({
	type: "div",
	props: {
		style: {
			display: "flex",
			...style
		},
		...children === void 0 ? {} : { children }
	}
});
/** Taille du nom d'une team selon sa longueur, pour qu'il tienne en deux lignes au plus. */
function nameSize(name) {
	if (name.length > 26) return 50;
	if (name.length > 16) return 62;
	if (name.length > 10) return 76;
	return 92;
}
function header(texts, right) {
	return el({
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%"
	}, [el({
		alignItems: "center",
		gap: 16
	}, [el({
		background: YELLOW,
		color: INK,
		padding: "0 14px",
		fontSize: 46
	}, texts.logo), el({
		color: FG,
		fontSize: 46,
		textTransform: "uppercase"
	}, texts.name)]), ...right ? [el({
		color: YELLOW,
		fontFamily: "Space Mono",
		fontSize: 24,
		fontWeight: 700,
		textTransform: "uppercase"
	}, right)] : []]);
}
function footer(texts) {
	return el({
		color: MUTED,
		fontFamily: "Space Mono",
		fontSize: 26,
		fontWeight: 700
	}, formatText(texts.cta, { domain: texts.domain }));
}
function teamCard(name, color, texts) {
	return el({
		flex: 1,
		minWidth: 0,
		height: 290,
		flexDirection: "column",
		justifyContent: "space-between",
		padding: 30,
		background: color,
		color: INK,
		boxShadow: `10px 10px 0 ${FG}`
	}, [el({
		alignSelf: "flex-start",
		padding: "4px 12px",
		background: INK,
		color: FG,
		fontFamily: "Space Mono",
		fontSize: 22,
		fontWeight: 700
	}, texts.team.toUpperCase()), el({
		fontSize: nameSize(name),
		lineHeight: 1,
		textTransform: "uppercase"
	}, name.toUpperCase())]);
}
var frame = {
	width: OG_WIDTH - 112,
	height: 534,
	padding: `48px 56px`,
	flexDirection: "column",
	justifyContent: "space-between",
	background: INK,
	fontFamily: "Anton"
};
function debateLayout(debate, texts) {
	const [colorA, colorB] = teamColors(debate.id);
	return el({ ...frame }, [
		header(texts, debate.category),
		el({
			alignItems: "center",
			gap: 28,
			width: "100%"
		}, [
			teamCard(debate.a, colorA, texts),
			el({
				width: 104,
				height: 104,
				flexShrink: 0,
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 52,
				background: FG,
				color: INK,
				fontSize: 44
			}, texts.vs.toUpperCase()),
			teamCard(debate.b, colorB, texts)
		]),
		footer(texts)
	]);
}
function siteLayout(texts) {
	return el({ ...frame }, [
		header(texts),
		el({
			flexDirection: "column",
			fontSize: 92,
			lineHeight: 1.08,
			textTransform: "uppercase"
		}, texts.heroLines.map((line, i) => el({ color: i === 2 ? PINK : FG }, line.toUpperCase()))),
		footer(texts)
	]);
}
var require = createRequire(import.meta.url);
var ready = null;
/** Charge les polices et le moteur WebAssembly une seule fois. */
function setup() {
	ready ??= (async () => {
		try {
			await initWasm(readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm")));
		} catch (error) {
			if (!(error instanceof Error && error.message.includes("Already initialized"))) throw error;
		}
		const font = (file) => readFileSync(require.resolve(file));
		return { fonts: [
			{
				name: "Anton",
				data: font("@fontsource/anton/files/anton-latin-400-normal.woff"),
				weight: 400
			},
			{
				name: "Anton",
				data: font("@fontsource/anton/files/anton-latin-ext-400-normal.woff"),
				weight: 400
			},
			{
				name: "Space Mono",
				data: font("@fontsource/space-mono/files/space-mono-latin-700-normal.woff"),
				weight: 700
			}
		] };
	})();
	return ready;
}
async function render(node) {
	const { fonts } = await setup();
	const svg = await satori(node, {
		width: OG_WIDTH,
		height: 630,
		fonts
	});
	return new Resvg(svg, { fitTo: {
		mode: "width",
		value: OG_WIDTH
	} }).render().asPng();
}
/** Cache mémoire des dernières images, et des rendus en cours (un seul rendu par image). */
var CACHE_SIZE = 64;
var cache = /* @__PURE__ */ new Map();
/** Lit l'image sur disque, sinon la dessine et l'y range. Le disque est facultatif : une erreur n'empêche pas l'image. */
async function fromDisk(dir, node) {
	const file = dir ? join(dir, `${hashString(JSON.stringify(node)).toString(36)}.png`) : null;
	if (file) try {
		return readFileSync(file);
	} catch {}
	const png = await render(node);
	if (dir && file) try {
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, png);
	} catch (error) {
		console.warn("[og] cache disque indisponible :", error);
	}
	return png;
}
function cached(key, make) {
	const hit = cache.get(key);
	if (hit) {
		cache.delete(key);
		cache.set(key, hit);
		return hit;
	}
	const promise = make().catch((error) => {
		cache.delete(key);
		throw error;
	});
	cache.set(key, promise);
	if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value);
	return promise;
}
function renderDebateImage(debate, texts, cacheDir = null) {
	const node = debateLayout(debate, texts);
	return cached(JSON.stringify(node), () => fromDisk(cacheDir, node));
}
function renderSiteImage(texts, cacheDir = null) {
	const node = siteLayout(texts);
	return cached(JSON.stringify(node), () => fromDisk(cacheDir, node));
}
// src/pages/og/[id].png.ts
var _id__png_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var byId = new Map(rivalries.map((r) => [r.id, r]));
var categoryLabel = new Map(categories.map((c) => [c.id, c.label]));
var texts = {
	logo: ui.site.logo,
	name: ui.site.name,
	team: ui.debate.team,
	vs: ui.debate.vs,
	cta: ui.og.cta,
	domain: ui.site.domain,
	heroLines: ui.home.title
};
var GET = async ({ params }) => {
	const id = params.id ?? "";
	const rivalry = byId.get(id);
	if (id !== "site" && !rivalry) return new Response("Not found", { status: 404 });
	const cacheDir = getSecret("OG_CACHE_DIR") ?? "data/og";
	try {
		const png = rivalry ? await renderDebateImage({
			id: rivalry.id,
			category: categoryLabel.get(rivalry.category) ?? "",
			a: rivalry.a.name,
			b: rivalry.b.name
		}, texts, cacheDir) : await renderSiteImage(texts, cacheDir);
		return new Response(new Uint8Array(png), { headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
			"X-Content-Type-Options": "nosniff"
		} });
	} catch (error) {
		console.error("[og] rendu impossible :", error);
		return new Response("Image unavailable", { status: 500 });
	}
};
// \0virtual:astro:page:src/pages/og/[id].png@_@ts
var page = () => _id__png_exports;
export { page };
