import { a as getSecret, i as universes, n as rivalries, t as categories } from "./content_D4-3keF-.mjs";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
var ranked = (r) => {
	const total = r.aVotes + r.bVotes;
	return {
		...r,
		total,
		aPercent: total ? Math.round(r.aVotes / total * 100) : 50
	};
};
/** Écart relatif entre les deux teams : 0 = égalité parfaite, 1 = unanimité. */
var margin = (r) => Math.abs(r.aVotes - r.bVotes) / r.total;
function rankRivalries(rows, { limit = 5, popularLimit = 10, minVotes = 10 } = {}) {
	const all = rows.map(ranked).filter((r) => r.total > 0);
	const judged = all.filter((r) => r.total >= minVotes);
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
* un joueur rapide au clavier) et 2 000 votes par jour.
*/
var RATE = {
	/** Rafale maximale : quelques votes rapprochés restent comptés. */
	burst: 5,
	/** Un jeton regagné par seconde, soit 1 vote par seconde en moyenne. */
	refillPerMs: 1 / 1e3,
	daily: 2e3
};
/** Jour UTC « AAAA-MM-JJ ». */
function dayOf(nowMs) {
	return new Date(nowMs).toISOString().slice(0, 10);
}
function hashIp(ip, salt, day) {
	return createHash("sha256").update(`${salt}|${day}|${ip}`).digest("hex").slice(0, 32);
}
/** Consomme un jeton si possible. `prev` absent = premier vote de la journée. */
function takeToken(prev, nowMs) {
	const elapsed = prev ? Math.max(0, nowMs - prev.updatedMs) : 0;
	const tokens = prev ? Math.min(RATE.burst, prev.tokens + elapsed * RATE.refillPerMs) : RATE.burst;
	const count = prev?.count ?? 0;
	if (count >= RATE.daily) return {
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
	team: z.enum(["a", "b"]),
	category: z.string().min(1).max(60)
});
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
			return outcome.status === "counted" ? {
				status: 200,
				body: {
					counted: true,
					...outcome.pair
				}
			} : {
				status: 429,
				body: {
					counted: false,
					reason: outcome.reason,
					...outcome.pair
				}
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
* - rivalry_votes(rivalry_id, a_votes, b_votes) : les votes de chaque rivalité
* - rate_limits(ip_hash, day, tokens, updated_ms, count) : empreintes d'IP, jamais d'IP en clair
*
* L'interface `VoteStore` isole le reste du code de SQLite (passage à MySQL possible).
*/
/** Migrations successives, appliquées une fois (suivies par `PRAGMA user_version`). */
var MIGRATIONS = [`CREATE TABLE contenders (
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
   CREATE INDEX rate_limits_day ON rate_limits(day);`, `DROP TABLE contenders;
   DROP TABLE pairs;
   CREATE TABLE rivalry_votes (
     rivalry_id TEXT PRIMARY KEY,
     a_votes INTEGER NOT NULL DEFAULT 0,
     b_votes INTEGER NOT NULL DEFAULT 0
   ) STRICT;`];
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
		voteA: db.prepare(`INSERT INTO rivalry_votes (rivalry_id, a_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET a_votes = a_votes + 1`),
		voteB: db.prepare(`INSERT INTO rivalry_votes (rivalry_id, b_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET b_votes = b_votes + 1`),
		one: db.prepare("SELECT a_votes AS aVotes, b_votes AS bVotes FROM rivalry_votes WHERE rivalry_id = ?"),
		all: db.prepare("SELECT rivalry_id AS id, a_votes AS aVotes, b_votes AS bVotes FROM rivalry_votes"),
		prefix: db.prepare(`SELECT rivalry_id AS id, a_votes AS aVotes, b_votes AS bVotes FROM rivalry_votes
       WHERE rivalry_id LIKE ? ESCAPE '\\'`)
	};
	let lastPurgeDay = "";
	function pairResult(rivalryId, team) {
		const row = q.one.get(rivalryId);
		if (!row) return {
			chosenVotes: 0,
			totalVotes: 0
		};
		return {
			chosenVotes: team === "a" ? row.aVotes : row.bVotes,
			totalVotes: row.aVotes + row.bVotes
		};
	}
	return {
		recordVote({ rivalryId, team, ipHash, day, nowMs }) {
			db.exec("BEGIN IMMEDIATE");
			try {
				if (lastPurgeDay !== day) {
					q.purge.run(day);
					lastPurgeDay = day;
				}
				const taken = takeToken(q.getBucket.get(ipHash), nowMs);
				q.putBucket.run(ipHash, day, taken.next.tokens, taken.next.updatedMs, taken.next.count);
				if (taken.allowed) (team === "a" ? q.voteA : q.voteB).run(rivalryId);
				const pair = pairResult(rivalryId, team);
				db.exec("COMMIT");
				return taken.allowed ? {
					status: "counted",
					pair
				} : {
					status: "rate-limited",
					reason: taken.reason,
					pair
				};
			} catch (error) {
				db.exec("ROLLBACK");
				throw error;
			}
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
/**
* Adresse du visiteur. Derrière un proxy (hébergement mutualisé), l'adresse directe est celle
* du proxy : avec TRUST_PROXY=true, on lit la première adresse de X-Forwarded-For.
*/
function clientIp(request, clientAddress) {
	if (getSecret("TRUST_PROXY") === "true") {
		const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
		if (forwarded) return forwarded;
	}
	try {
		return clientAddress();
	} catch {
		return "unknown";
	}
}
/**
* Le vote vient-il du site lui-même ? Sans en-tête Origin (ancien navigateur, outil), on laisse
* passer : la limite de débit s'applique de toute façon. On compare à l'hôte demandé par le
* navigateur (Host, ou X-Forwarded-Host derrière un proxy), pas à l'URL interne du serveur.
*/
function isSameOrigin(request) {
	const origin = request.headers.get("origin");
	if (!origin) return true;
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}
var jsonResponse = (body, status, cacheControl = "no-store") => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": cacheControl
	}
});
export { HALL_TTL_MS as a, jsonResponse as i, getVoteService as n, isSameOrigin as r, clientIp as t };
