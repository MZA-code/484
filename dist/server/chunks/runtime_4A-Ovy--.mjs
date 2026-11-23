import { a as universes, n as categories, r as rivalries, t as getSecret } from "./server_ClkvM-mp.mjs";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";
import { createHash, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
// src/server/votes/guard.ts
/** Outils en ligne de commande, bibliothèques HTTP, navigateurs pilotés, robots déclarés. */
var AUTOMATED_AGENT = /curl|wget|python|httpie|go-http|java\/|okhttp|axios|node-fetch|undici|libwww|scrapy|aiohttp|headless|phantomjs|puppeteer|playwright|selenium|\bbot\b|bot\/|crawler|spider/i;
/** L'hôte demandé par le navigateur (Host, ou X-Forwarded-Host derrière un proxy). */
function requestedHost(headers, requestUrl) {
	return headers.get("x-forwarded-host") ?? headers.get("host") ?? new URL(requestUrl).host;
}
function isSameSite(origin, headers, requestUrl) {
	if (origin === null) return false;
	try {
		return new URL(origin).host === requestedHost(headers, requestUrl);
	} catch {
		return false;
	}
}
/**
* null si la requête peut passer, sinon le refus à renvoyer.
* - Origin obligatoire et identique au site : tous les navigateurs l'envoient sur un POST.
* - Corps JSON : un formulaire HTML d'un autre site ne peut pas en envoyer sans autorisation.
* - Navigateur : User-Agent présent, et pas celui d'un outil d'automatisation connu.
*/
function checkWriteRequest(headers, requestUrl) {
	if (!isSameSite(headers.get("origin"), headers, requestUrl)) return {
		status: 403,
		error: "forbidden-origin"
	};
	if (!(headers.get("content-type")?.toLowerCase() ?? "").startsWith("application/json")) return {
		status: 415,
		error: "json-required"
	};
	const agent = headers.get("user-agent") ?? "";
	if (!agent || AUTOMATED_AGENT.test(agent)) return {
		status: 403,
		error: "automated-client"
	};
	return null;
}
/**
* Nombre de proxys de confiance devant le serveur, depuis TRUST_PROXY :
* « true » = 1, un nombre = ce nombre, autre chose = 0 (pas de proxy).
*/
function trustedHops(setting) {
	if (setting === "true") return 1;
	const n = Number(setting);
	return Number.isInteger(n) && n > 0 ? n : 0;
}
/**
* Adresse réelle du visiteur.
*
* Chaque proxy AJOUTE à droite de X-Forwarded-For l'adresse de qui lui parle. Les adresses de
* gauche viennent donc du visiteur lui-même, qui peut en inventer autant qu'il veut. Avec
* `hops` proxys de confiance, la bonne adresse est la `hops`-ième en partant de la droite :
* c'est celle qu'a écrite notre propre proxy, impossible à falsifier.
*/
function pickClientIp(forwardedFor, direct, hops) {
	if (hops <= 0) return direct;
	const chain = (forwardedFor ?? "").split(",").map((part) => part.trim()).filter(Boolean);
	if (chain.length === 0) return direct;
	return chain[Math.max(0, chain.length - hops)] ?? direct;
}
var ranked = (r) => {
	const total = r.aVotes + r.bVotes + r.noneVotes + r.bothVotes;
	if (!total) return {
		...r,
		total,
		aPercent: 50,
		bothPercent: 0,
		nonePercent: 0,
		bPercent: 50
	};
	const aPercent = Math.round(r.aVotes / total * 100);
	const bothPercent = Math.round(r.bothVotes / total * 100);
	const nonePercent = Math.round(r.noneVotes / total * 100);
	return {
		...r,
		total,
		aPercent,
		bothPercent,
		nonePercent,
		bPercent: Math.max(0, 100 - aPercent - bothPercent - nonePercent)
	};
};
/** Votes pour l'une des deux teams (sans « aucun des deux » ni « les deux »). */
var sided = (r) => r.aVotes + r.bVotes;
/**
* Écart relatif entre les deux teams, parmi ceux qui ont choisi un camp :
* 0 = égalité parfaite, 1 = unanimité. « Aucun des deux » et « les deux » ne rendent pas un débat serré.
*/
var margin = (r) => Math.abs(r.aVotes - r.bVotes) / sided(r);
function rankRivalries(rows, { limit = 5, popularLimit = 10, minVotes = 10 } = {}) {
	const all = rows.map(ranked).filter((r) => r.total > 0);
	const judged = all.filter((r) => sided(r) >= minVotes);
	const byId = (a, b) => a.id.localeCompare(b.id);
	const closest = [...judged].sort((a, b) => margin(a) - margin(b) || b.total - a.total || byId(a, b)).slice(0, limit);
	const inClosest = new Set(closest.map((r) => r.id));
	return {
		closest,
		landslides: judged.filter((r) => !inClosest.has(r.id)).sort((a, b) => margin(b) - margin(a) || b.total - a.total || byId(a, b)).slice(0, limit),
		popular: [...all].sort((a, b) => b.total - a.total || byId(a, b)).slice(0, popularLimit)
	};
}
// src/server/votes/rate-limit.ts
/**
* Anti-abus sans cookie.
*
* L'IP n'est jamais stockée en clair : on garde une empreinte SHA-256 de (sel secret + jour + IP).
* Comme le jour entre dans l'empreinte, deux journées d'un même visiteur ne peuvent pas être reliées.
*
* Limites : en moyenne 1 vote par seconde (seau de jetons, petites rafales tolérées pour
* un joueur rapide au clavier) et 600 votes par jour. En plus, un visiteur ne compte qu'une fois
* par jour pour une même rivalité (voir store.ts).
*/
var RATE = {
	/** Rafale maximale : quelques votes rapprochés restent comptés. */
	burst: 5,
	/** Un jeton regagné par seconde, soit 1 vote par seconde en moyenne. */
	refillPerMs: 1 / 1e3,
	/** Largement assez pour un humain (une partie de 600 débats d'affilée), pas pour un robot. */
	daily: 600
};
/** Signalements de GIF : 3 d'affilée, puis 1 par minute, 30 par jour. Personne n'en fait plus. */
var REPORT_RATE = {
	burst: 3,
	refillPerMs: 1 / 6e4,
	daily: 30
};
/** Jour UTC « AAAA-MM-JJ ». */
function dayOf(nowMs) {
	return new Date(nowMs).toISOString().slice(0, 10);
}
function hashIp(ip, salt, day) {
	return createHash("sha256").update(`${salt}|${day}|${ip}`).digest("hex").slice(0, 32);
}
/** Consomme un jeton si possible. `prev` absent = première action de la journée. */
function takeToken(prev, nowMs, rate = RATE) {
	const elapsed = prev ? Math.max(0, nowMs - prev.updatedMs) : 0;
	const tokens = prev ? Math.min(rate.burst, prev.tokens + elapsed * rate.refillPerMs) : rate.burst;
	const count = prev?.count ?? 0;
	if (count >= rate.daily) return {
		allowed: false,
		reason: "daily",
		next: {
			tokens,
			updatedMs: nowMs,
			count
		}
	};
	if (tokens < 1) return {
		allowed: false,
		reason: "burst",
		next: {
			tokens,
			updatedMs: nowMs,
			count
		}
	};
	return {
		allowed: true,
		next: {
			tokens: tokens - 1,
			updatedMs: nowMs,
			count: count + 1
		}
	};
}
/** Durée de cache du Hall of Fame (côté serveur et navigateur). */
var HALL_TTL_MS = 6e4;
var VoteBody = z.object({
	rivalryId: z.string().min(1).max(160),
	team: z.enum([
		"a",
		"b",
		"none",
		"both"
	]),
	category: z.string().min(1).max(60)
});
var GifReportBody = z.object({
	/** « rivalité/a » ou « rivalité/b », comme la route /api/gif. */
	teamId: z.string().regex(/^[a-z0-9-]{1,160}\/[ab]$/),
	/** Identifiant Giphy : lettres et chiffres. */
	gifId: z.string().regex(/^[A-Za-z0-9]{1,64}$/)
});
/** Comparaison en temps constant : la durée ne trahit pas le jeton attendu. */
function sameToken(given, expected) {
	const a = Buffer.from(given);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}
function createVoteService({ store, salt, rivalries, categoryIds, universes = [], now = Date.now }) {
	const categoryOf = new Map(rivalries.map((r) => [r.id, r.category]));
	/** Catégories couvertes par chaque filtre possible : une catégorie, un univers, ou tout. */
	const scopes = new Map([
		...categoryIds.map((c) => [c, /* @__PURE__ */ new Set([c])]),
		...universes.map((u) => [u.id, new Set(u.categories)]),
		["mix", new Set(categoryIds)]
	]);
	const hallCache = /* @__PURE__ */ new Map();
	const isCategory = (c) => scopes.has(c);
	return {
		vote(raw, ip) {
			const parsed = VoteBody.safeParse(raw);
			if (!parsed.success) return {
				status: 400,
				body: { error: "invalid-body" }
			};
			const { rivalryId, team, category } = parsed.data;
			const rivalryCategory = categoryOf.get(rivalryId);
			if (!rivalryCategory) return {
				status: 400,
				body: { error: "unknown-rivalry" }
			};
			if (!isCategory(category)) return {
				status: 400,
				body: { error: "unknown-category" }
			};
			if (!scopes.get(category)?.has(rivalryCategory)) return {
				status: 400,
				body: { error: "category-mismatch" }
			};
			const nowMs = now();
			const day = dayOf(nowMs);
			const outcome = store.recordVote({
				rivalryId,
				team,
				ipHash: hashIp(ip, salt, day),
				day,
				nowMs
			});
			if (outcome.status === "counted") return {
				status: 200,
				body: {
					counted: true,
					...outcome.pair
				}
			};
			if (outcome.status === "duplicate") return {
				status: 200,
				body: {
					counted: false,
					reason: "duplicate",
					...outcome.pair
				}
			};
			return {
				status: 429,
				body: {
					counted: false,
					reason: outcome.reason,
					...outcome.pair
				}
			};
		},
		/**
		* « Mauvais GIF ? » : un signalement de plus pour ce GIF de cette team.
		* En mode admin (`admin`), pas de limite, et le GIF est écarté tout de suite.
		*/
		reportGif(raw, ip, admin = false) {
			const parsed = GifReportBody.safeParse(raw);
			if (!parsed.success) return {
				status: 400,
				body: { error: "invalid-body" }
			};
			const [rivalryId, team] = parsed.data.teamId.split("/");
			if (!categoryOf.has(rivalryId)) return {
				status: 400,
				body: { error: "unknown-rivalry" }
			};
			const nowMs = now();
			const day = dayOf(nowMs);
			const outcome = store.recordGifReport({
				rivalryId,
				team,
				gifId: parsed.data.gifId,
				ipHash: hashIp(ip, salt, day),
				day,
				nowMs,
				...admin ? { trusted: { weight: 3 } } : {}
			});
			if (outcome.status === "counted") return {
				status: 200,
				body: admin ? {
					counted: true,
					rejected: true
				} : { counted: true }
			};
			if (outcome.status === "duplicate") return {
				status: 200,
				body: {
					counted: false,
					reason: "duplicate"
				}
			};
			return {
				status: 429,
				body: {
					counted: false,
					reason: outcome.reason
				}
			};
		},
		/** GIF de cette team écartés par les signalements (à remplacer par le suivant). */
		rejectedGifs(rivalryId, team) {
			if (!categoryOf.has(rivalryId)) return /* @__PURE__ */ new Set();
			return new Set(store.reportedGifIds(rivalryId, team, 3));
		},
		/**
		* Liste des signalements pour `npm run gif-audit`, protégée par un jeton.
		* Sans jeton configuré côté serveur, la liste n'existe pas (404).
		*/
		gifReports(authorization, token) {
			if (!token) return {
				status: 404,
				body: { error: "not-found" }
			};
			if (!sameToken(authorization?.replace(/^Bearer\s+/i, "") ?? "", token)) return {
				status: 401,
				body: { error: "unauthorized" }
			};
			return {
				status: 200,
				body: { reports: store.gifReports().filter((r) => categoryOf.has(r.rivalryId)) }
			};
		},
		hallOfFame(categoryParam) {
			const category = categoryParam || "mix";
			if (!isCategory(category)) return {
				status: 400,
				body: { error: "unknown-category" }
			};
			const nowMs = now();
			const hit = hallCache.get(category);
			if (hit && hit.expires > nowMs) return {
				status: 200,
				body: hit.value
			};
			const scope = scopes.get(category);
			const rows = store.rivalryCounts(null).filter((r) => {
				const rivalryCategory = categoryOf.get(r.id);
				return rivalryCategory !== void 0 && scope.has(rivalryCategory);
			});
			const value = {
				category,
				totalVotes: rows.reduce((sum, r) => sum + r.aVotes + r.bVotes, 0),
				...rankRivalries(rows),
				generatedAt: new Date(nowMs).toISOString()
			};
			hallCache.set(category, {
				expires: nowMs + HALL_TTL_MS,
				value
			});
			return {
				status: 200,
				body: value
			};
		}
	};
}
// src/server/votes/store.ts
/**
* Stockage des votes dans SQLite (module `node:sqlite` intégré à Node, rien à installer).
*
* Tables :
* - rivalry_votes(rivalry_id, a_votes, b_votes, none_votes, both_votes) : les votes de chaque
*   rivalité (« aucun des deux » et « les deux » compris)
* - rate_limits(ip_hash, day, tokens, updated_ms, count) : empreintes d'IP, jamais d'IP en clair
* - gif_reports(rivalry_id, team, gif_id, reports, last_ms) : signalements « Mauvais GIF ? »
* - report_limits : comme rate_limits, pour les signalements (limite séparée, plus stricte)
* - vote_seen, gif_report_seen : qui (empreinte du jour) a déjà voté pour une rivalité ou signalé
*   un GIF aujourd'hui ; un visiteur ne compte qu'une fois par jour. Effacées chaque jour.
*
* L'interface `VoteStore` isole le reste du code de SQLite (passage à MySQL possible).
*/
/** Migrations successives, appliquées une fois (suivies par `PRAGMA user_version`). */
var MIGRATIONS = [
	`CREATE TABLE contenders (
     id TEXT PRIMARY KEY,
     wins INTEGER NOT NULL DEFAULT 0,
     losses INTEGER NOT NULL DEFAULT 0
   ) STRICT;
   CREATE TABLE pairs (
     a_id TEXT NOT NULL,
     b_id TEXT NOT NULL,
     a_wins INTEGER NOT NULL DEFAULT 0,
     b_wins INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (a_id, b_id),
     CHECK (a_id < b_id)
   ) STRICT;
   CREATE TABLE rate_limits (
     ip_hash TEXT PRIMARY KEY,
     day TEXT NOT NULL,
     tokens REAL NOT NULL,
     updated_ms INTEGER NOT NULL,
     count INTEGER NOT NULL
   ) STRICT;
   CREATE INDEX rate_limits_day ON rate_limits(day);`,
	`DROP TABLE contenders;
   DROP TABLE pairs;
   CREATE TABLE rivalry_votes (
     rivalry_id TEXT PRIMARY KEY,
     a_votes INTEGER NOT NULL DEFAULT 0,
     b_votes INTEGER NOT NULL DEFAULT 0
   ) STRICT;`,
	`CREATE TABLE gif_reports (
     rivalry_id TEXT NOT NULL,
     team TEXT NOT NULL CHECK (team IN ('a', 'b')),
     gif_id TEXT NOT NULL,
     reports INTEGER NOT NULL DEFAULT 0,
     last_ms INTEGER NOT NULL,
     PRIMARY KEY (rivalry_id, team, gif_id)
   ) STRICT;
   CREATE TABLE report_limits (
     ip_hash TEXT PRIMARY KEY,
     day TEXT NOT NULL,
     tokens REAL NOT NULL,
     updated_ms INTEGER NOT NULL,
     count INTEGER NOT NULL
   ) STRICT;
   CREATE INDEX report_limits_day ON report_limits(day);`,
	`CREATE TABLE vote_seen (
     rivalry_id TEXT NOT NULL,
     ip_hash TEXT NOT NULL,
     day TEXT NOT NULL,
     PRIMARY KEY (rivalry_id, ip_hash)
   ) STRICT;
   CREATE INDEX vote_seen_day ON vote_seen(day);
   CREATE TABLE gif_report_seen (
     rivalry_id TEXT NOT NULL,
     team TEXT NOT NULL,
     gif_id TEXT NOT NULL,
     ip_hash TEXT NOT NULL,
     day TEXT NOT NULL,
     PRIMARY KEY (rivalry_id, team, gif_id, ip_hash)
   ) STRICT;
   CREATE INDEX gif_report_seen_day ON gif_report_seen(day);`,
	`ALTER TABLE rivalry_votes ADD COLUMN none_votes INTEGER NOT NULL DEFAULT 0;`,
	`ALTER TABLE rivalry_votes ADD COLUMN both_votes INTEGER NOT NULL DEFAULT 0;`
];
/** Échappe `%` et `_` pour un LIKE sur préfixe. */
var likePrefix = (prefix) => `${prefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
function openSqliteStore(file) {
	if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });
	const db = new DatabaseSync(file);
	db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 3000;");
	const version = Number(db.prepare("PRAGMA user_version").get().user_version);
	MIGRATIONS.slice(version).forEach((sql, i) => {
		db.exec("BEGIN");
		db.exec(sql);
		db.exec(`PRAGMA user_version = ${version + i + 1}`);
		db.exec("COMMIT");
	});
	const q = {
		getBucket: db.prepare("SELECT tokens, updated_ms AS updatedMs, count FROM rate_limits WHERE ip_hash = ?"),
		putBucket: db.prepare(`INSERT INTO rate_limits (ip_hash, day, tokens, updated_ms, count) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET tokens = excluded.tokens, updated_ms = excluded.updated_ms, count = excluded.count`),
		purge: db.prepare("DELETE FROM rate_limits WHERE day < ?"),
		purgeVoteSeen: db.prepare("DELETE FROM vote_seen WHERE day < ?"),
		seeVote: db.prepare("INSERT OR IGNORE INTO vote_seen (rivalry_id, ip_hash, day) VALUES (?, ?, ?)"),
		purgeReportSeen: db.prepare("DELETE FROM gif_report_seen WHERE day < ?"),
		seeReport: db.prepare(`INSERT OR IGNORE INTO gif_report_seen (rivalry_id, team, gif_id, ip_hash, day)
       VALUES (?, ?, ?, ?, ?)`),
		reportedIds: db.prepare("SELECT gif_id AS gifId FROM gif_reports WHERE rivalry_id = ? AND team = ? AND reports >= ?"),
		getReportBucket: db.prepare("SELECT tokens, updated_ms AS updatedMs, count FROM report_limits WHERE ip_hash = ?"),
		putReportBucket: db.prepare(`INSERT INTO report_limits (ip_hash, day, tokens, updated_ms, count) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET tokens = excluded.tokens, updated_ms = excluded.updated_ms, count = excluded.count`),
		purgeReports: db.prepare("DELETE FROM report_limits WHERE day < ?"),
		report: db.prepare(`INSERT INTO gif_reports (rivalry_id, team, gif_id, reports, last_ms) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(rivalry_id, team, gif_id)
       DO UPDATE SET reports = reports + excluded.reports, last_ms = excluded.last_ms`),
		reports: db.prepare(`SELECT rivalry_id AS rivalryId, team, gif_id AS gifId, reports, last_ms AS lastMs
       FROM gif_reports ORDER BY reports DESC, last_ms DESC`),
		voteA: db.prepare(`INSERT INTO rivalry_votes (rivalry_id, a_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET a_votes = a_votes + 1`),
		voteB: db.prepare(`INSERT INTO rivalry_votes (rivalry_id, b_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET b_votes = b_votes + 1`),
		voteNone: db.prepare(`INSERT INTO rivalry_votes (rivalry_id, none_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET none_votes = none_votes + 1`),
		voteBoth: db.prepare(`INSERT INTO rivalry_votes (rivalry_id, both_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET both_votes = both_votes + 1`),
		one: db.prepare(`SELECT a_votes AS aVotes, b_votes AS bVotes, none_votes AS noneVotes,
              both_votes AS bothVotes
       FROM rivalry_votes WHERE rivalry_id = ?`),
		all: db.prepare(`SELECT rivalry_id AS id, a_votes AS aVotes, b_votes AS bVotes, none_votes AS noneVotes,
              both_votes AS bothVotes
       FROM rivalry_votes`),
		prefix: db.prepare(`SELECT rivalry_id AS id, a_votes AS aVotes, b_votes AS bVotes, none_votes AS noneVotes,
              both_votes AS bothVotes
       FROM rivalry_votes WHERE rivalry_id LIKE ? ESCAPE '\\'`)
	};
	let lastPurgeDay = "";
	let lastReportPurgeDay = "";
	function pairResult(rivalryId, choice) {
		const counts = q.one.get(rivalryId) ?? {
			aVotes: 0,
			bVotes: 0,
			noneVotes: 0,
			bothVotes: 0
		};
		return {
			chosenVotes: {
				a: counts.aVotes,
				b: counts.bVotes,
				none: counts.noneVotes,
				both: counts.bothVotes
			}[choice],
			totalVotes: counts.aVotes + counts.bVotes + counts.noneVotes + counts.bothVotes,
			...counts
		};
	}
	const voteFor = {
		a: q.voteA,
		b: q.voteB,
		none: q.voteNone,
		both: q.voteBoth
	};
	return {
		recordVote({ rivalryId, team, ipHash, day, nowMs }) {
			db.exec("BEGIN IMMEDIATE");
			try {
				if (lastPurgeDay !== day) {
					q.purge.run(day);
					q.purgeVoteSeen.run(day);
					lastPurgeDay = day;
				}
				const taken = takeToken(q.getBucket.get(ipHash), nowMs);
				q.putBucket.run(ipHash, day, taken.next.tokens, taken.next.updatedMs, taken.next.count);
				const first = taken.allowed && Number(q.seeVote.run(rivalryId, ipHash, day).changes) > 0;
				if (first) voteFor[team].run(rivalryId);
				const pair = pairResult(rivalryId, team);
				db.exec("COMMIT");
				if (!taken.allowed) return {
					status: "rate-limited",
					reason: taken.reason,
					pair
				};
				return first ? {
					status: "counted",
					pair
				} : {
					status: "duplicate",
					pair
				};
			} catch (error) {
				db.exec("ROLLBACK");
				throw error;
			}
		},
		recordGifReport({ rivalryId, team, gifId, ipHash, day, nowMs, trusted }) {
			if (trusted) {
				q.report.run(rivalryId, team, gifId, trusted.weight, nowMs);
				return { status: "counted" };
			}
			db.exec("BEGIN IMMEDIATE");
			try {
				if (lastReportPurgeDay !== day) {
					q.purgeReports.run(day);
					q.purgeReportSeen.run(day);
					lastReportPurgeDay = day;
				}
				const taken = takeToken(q.getReportBucket.get(ipHash), nowMs, REPORT_RATE);
				q.putReportBucket.run(ipHash, day, taken.next.tokens, taken.next.updatedMs, taken.next.count);
				const first = taken.allowed && Number(q.seeReport.run(rivalryId, team, gifId, ipHash, day).changes) > 0;
				if (first) q.report.run(rivalryId, team, gifId, 1, nowMs);
				db.exec("COMMIT");
				if (!taken.allowed) return {
					status: "rate-limited",
					reason: taken.reason
				};
				return first ? { status: "counted" } : { status: "duplicate" };
			} catch (error) {
				db.exec("ROLLBACK");
				throw error;
			}
		},
		gifReports() {
			return q.reports.all().map(({ lastMs, ...row }) => ({
				...row,
				lastReport: new Date(lastMs).toISOString()
			}));
		},
		reportedGifIds(rivalryId, team, minReports) {
			return q.reportedIds.all(rivalryId, team, minReports).map((r) => r.gifId);
		},
		rivalryCounts(idPrefix) {
			return idPrefix ? q.prefix.all(likePrefix(idPrefix)) : q.all.all();
		},
		close() {
			db.close();
		}
	};
}
// src/server/votes/runtime.ts
/**
* Instance unique du service de votes pour le serveur Astro (créée au premier appel).
* Les secrets viennent de `astro:env` : fichier .env en local, variables d'environnement en production.
*/
var service;
/** null si le sel n'est pas configuré : les votes sont alors désactivés (le jeu continue). */
function getVoteService() {
	if (service !== void 0) return service;
	const salt = getSecret("VOTE_HASH_SALT");
	if (!salt) {
		console.warn("[votes] VOTE_HASH_SALT is missing: global votes are disabled.");
		service = null;
		return service;
	}
	service = createVoteService({
		store: openSqliteStore(getSecret("VOTES_DB_FILE") ?? "data/votes.sqlite"),
		salt,
		rivalries,
		categoryIds: categories.map((c) => c.id),
		universes
	});
	return service;
}
/** Adresse directe de la connexion (le proxy, derrière un hébergement mutualisé). */
function directAddress(clientAddress) {
	try {
		return clientAddress();
	} catch {
		return "unknown";
	}
}
/**
* Adresse du visiteur. Derrière un proxy (hébergement mutualisé), l'adresse directe est celle
* du proxy : avec TRUST_PROXY=true, on lit X-Forwarded-For, en partant de la droite (voir guard.ts).
*/
function clientIp(request, clientAddress) {
	return pickClientIp(request.headers.get("x-forwarded-for"), directAddress(clientAddress), trustedHops(getSecret("TRUST_PROXY")));
}
/** En-tête qui porte le jeton du mode admin (voir src/lib/admin.ts). */
var ADMIN_HEADER = "x-484-admin";
/** La requête vient-elle de l'éditeur (jeton GIF_REPORT_TOKEN dans l'en-tête admin) ? */
function isAdminRequest(request) {
	const token = getSecret("GIF_REPORT_TOKEN");
	const given = request.headers.get(ADMIN_HEADER);
	return Boolean(token && given && sameToken(given, token));
}
/** Filtre anti-abus des routes qui écrivent : null si la requête passe, sinon la réponse de refus. */
function rejectWrite(request) {
	const rejection = checkWriteRequest(request.headers, request.url);
	return rejection ? jsonResponse({ error: rejection.error }, rejection.status) : null;
}
/**
* Diagnostic de l'adresse IP (GET /api/health?ip avec le jeton GIF_REPORT_TOKEN) : montre ce que
* le serveur reçoit et l'adresse qu'il retient, pour vérifier que X-Forwarded-For est bien lu.
*/
function ipDiagnostic(request, clientAddress) {
	return {
		direct: directAddress(clientAddress),
		forwardedFor: request.headers.get("x-forwarded-for"),
		trustProxy: getSecret("TRUST_PROXY") ?? null,
		chosen: clientIp(request, clientAddress)
	};
}
var jsonResponse = (body, status, cacheControl = "no-store") => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": cacheControl
	}
});
export { jsonResponse as a, sameToken as c, isAdminRequest as i, getVoteService as n, rejectWrite as o, ipDiagnostic as r, HALL_TTL_MS as s, clientIp as t };
