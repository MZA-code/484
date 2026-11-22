/**
 * Stockage des votes dans SQLite (module `node:sqlite` intégré à Node, rien à installer).
 *
 * Tables :
 * - rivalry_votes(rivalry_id, a_votes, b_votes) : les votes de chaque rivalité
 * - rate_limits(ip_hash, day, tokens, updated_ms, count) : empreintes d'IP, jamais d'IP en clair
 * - gif_reports(rivalry_id, team, gif_id, reports, last_ms) : signalements « Mauvais GIF ? »
 * - report_limits : comme rate_limits, pour les signalements (limite séparée, plus stricte)
 * - vote_seen, gif_report_seen : qui (empreinte du jour) a déjà voté pour une rivalité ou signalé
 *   un GIF aujourd'hui ; un visiteur ne compte qu'une fois par jour. Effacées chaque jour.
 *
 * L'interface `VoteStore` isole le reste du code de SQLite (passage à MySQL possible).
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { RivalryCounts } from './ranking';
import { REPORT_RATE, takeToken, type Bucket } from './rate-limit';

export type Team = 'a' | 'b';

export interface VoteInput {
  rivalryId: string;
  team: Team;
  ipHash: string;
  day: string;
  nowMs: number;
}

/** Votes de la rivalité, vus depuis le choix du visiteur. */
export interface PairResult {
  chosenVotes: number;
  totalVotes: number;
}

export type VoteOutcome =
  | { status: 'counted'; pair: PairResult }
  /** Ce visiteur a déjà voté pour cette rivalité aujourd'hui : rien n'est ajouté. */
  | { status: 'duplicate'; pair: PairResult }
  | { status: 'rate-limited'; reason: 'burst' | 'daily'; pair: PairResult };

export interface GifReportInput {
  rivalryId: string;
  team: Team;
  gifId: string;
  ipHash: string;
  day: string;
  nowMs: number;
  /**
   * Signalement de l'éditeur (mode admin) : ni limite de débit ni dédoublonnage,
   * et il compte pour `weight` signalements d'un coup.
   */
  trusted?: { weight: number };
}

export type GifReportOutcome =
  | { status: 'counted' }
  /** Ce visiteur a déjà signalé ce GIF aujourd'hui : rien n'est ajouté. */
  | { status: 'duplicate' }
  | { status: 'rate-limited'; reason: 'burst' | 'daily' };

/** Signalements cumulés d'un GIF d'une team. */
export interface GifReportRow {
  rivalryId: string;
  team: Team;
  gifId: string;
  reports: number;
  /** Date du dernier signalement (ISO). */
  lastReport: string;
}

export interface VoteStore {
  recordVote(input: VoteInput): VoteOutcome;
  recordGifReport(input: GifReportInput): GifReportOutcome;
  /** Tous les signalements, les plus signalés d'abord. */
  gifReports(): GifReportRow[];
  /** GIF d'une team signalés au moins `minReports` fois. */
  reportedGifIds(rivalryId: string, team: Team, minReports: number): string[];
  /** Votes par rivalité, filtrés sur un préfixe d'identifiant (« bouffe- ») ou tous. */
  rivalryCounts(idPrefix: string | null): RivalryCounts[];
  close(): void;
}

/** Migrations successives, appliquées une fois (suivies par `PRAGMA user_version`). */
const MIGRATIONS = [
  // 1. Mode « duels » (avant le pivot).
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
  // 2. Pivot « Team X ou Team Y » : un compteur par rivalité, les tables des duels disparaissent.
  `DROP TABLE contenders;
   DROP TABLE pairs;
   CREATE TABLE rivalry_votes (
     rivalry_id TEXT PRIMARY KEY,
     a_votes INTEGER NOT NULL DEFAULT 0,
     b_votes INTEGER NOT NULL DEFAULT 0
   ) STRICT;`,
  // 3. Signalements « Mauvais GIF ? » : des compteurs, jamais qui a signalé.
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
  // 4. Anti-spam : un vote par rivalité et un signalement par GIF, par visiteur et par jour.
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
];

/** Échappe `%` et `_` pour un LIKE sur préfixe. */
const likePrefix = (prefix: string) => `${prefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export function openSqliteStore(file: string): VoteStore {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 3000;');

  const version = Number(
    (db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version,
  );
  MIGRATIONS.slice(version).forEach((sql, i) => {
    db.exec('BEGIN');
    db.exec(sql);
    db.exec(`PRAGMA user_version = ${version + i + 1}`);
    db.exec('COMMIT');
  });

  const q = {
    getBucket: db.prepare(
      'SELECT tokens, updated_ms AS updatedMs, count FROM rate_limits WHERE ip_hash = ?',
    ),
    putBucket: db.prepare(
      `INSERT INTO rate_limits (ip_hash, day, tokens, updated_ms, count) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET tokens = excluded.tokens, updated_ms = excluded.updated_ms, count = excluded.count`,
    ),
    purge: db.prepare('DELETE FROM rate_limits WHERE day < ?'),
    purgeVoteSeen: db.prepare('DELETE FROM vote_seen WHERE day < ?'),
    seeVote: db.prepare(
      'INSERT OR IGNORE INTO vote_seen (rivalry_id, ip_hash, day) VALUES (?, ?, ?)',
    ),
    purgeReportSeen: db.prepare('DELETE FROM gif_report_seen WHERE day < ?'),
    seeReport: db.prepare(
      `INSERT OR IGNORE INTO gif_report_seen (rivalry_id, team, gif_id, ip_hash, day)
       VALUES (?, ?, ?, ?, ?)`,
    ),
    reportedIds: db.prepare(
      'SELECT gif_id AS gifId FROM gif_reports WHERE rivalry_id = ? AND team = ? AND reports >= ?',
    ),
    getReportBucket: db.prepare(
      'SELECT tokens, updated_ms AS updatedMs, count FROM report_limits WHERE ip_hash = ?',
    ),
    putReportBucket: db.prepare(
      `INSERT INTO report_limits (ip_hash, day, tokens, updated_ms, count) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET tokens = excluded.tokens, updated_ms = excluded.updated_ms, count = excluded.count`,
    ),
    purgeReports: db.prepare('DELETE FROM report_limits WHERE day < ?'),
    report: db.prepare(
      `INSERT INTO gif_reports (rivalry_id, team, gif_id, reports, last_ms) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(rivalry_id, team, gif_id)
       DO UPDATE SET reports = reports + excluded.reports, last_ms = excluded.last_ms`,
    ),
    reports: db.prepare(
      `SELECT rivalry_id AS rivalryId, team, gif_id AS gifId, reports, last_ms AS lastMs
       FROM gif_reports ORDER BY reports DESC, last_ms DESC`,
    ),
    voteA: db.prepare(
      `INSERT INTO rivalry_votes (rivalry_id, a_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET a_votes = a_votes + 1`,
    ),
    voteB: db.prepare(
      `INSERT INTO rivalry_votes (rivalry_id, b_votes) VALUES (?, 1)
       ON CONFLICT(rivalry_id) DO UPDATE SET b_votes = b_votes + 1`,
    ),
    one: db.prepare(
      'SELECT a_votes AS aVotes, b_votes AS bVotes FROM rivalry_votes WHERE rivalry_id = ?',
    ),
    all: db.prepare(
      'SELECT rivalry_id AS id, a_votes AS aVotes, b_votes AS bVotes FROM rivalry_votes',
    ),
    prefix: db.prepare(
      `SELECT rivalry_id AS id, a_votes AS aVotes, b_votes AS bVotes FROM rivalry_votes
       WHERE rivalry_id LIKE ? ESCAPE '\\'`,
    ),
  };

  let lastPurgeDay = '';
  let lastReportPurgeDay = '';

  function pairResult(rivalryId: string, team: Team): PairResult {
    const row = q.one.get(rivalryId) as { aVotes: number; bVotes: number } | undefined;
    if (!row) return { chosenVotes: 0, totalVotes: 0 };
    return {
      chosenVotes: team === 'a' ? row.aVotes : row.bVotes,
      totalVotes: row.aVotes + row.bVotes,
    };
  }

  return {
    recordVote({ rivalryId, team, ipHash, day, nowMs }) {
      db.exec('BEGIN IMMEDIATE');
      try {
        // Ménage des empreintes des jours précédents (une fois par jour suffit).
        if (lastPurgeDay !== day) {
          q.purge.run(day);
          q.purgeVoteSeen.run(day);
          lastPurgeDay = day;
        }
        const taken = takeToken(q.getBucket.get(ipHash) as Bucket | undefined, nowMs);
        q.putBucket.run(ipHash, day, taken.next.tokens, taken.next.updatedMs, taken.next.count);
        // Premier vote du jour de ce visiteur pour cette rivalité ? Sinon, on ne compte rien.
        const first = taken.allowed && Number(q.seeVote.run(rivalryId, ipHash, day).changes) > 0;
        if (first) (team === 'a' ? q.voteA : q.voteB).run(rivalryId);
        const pair = pairResult(rivalryId, team);
        db.exec('COMMIT');
        if (!taken.allowed) return { status: 'rate-limited', reason: taken.reason, pair };
        return first ? { status: 'counted', pair } : { status: 'duplicate', pair };
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },

    recordGifReport({ rivalryId, team, gifId, ipHash, day, nowMs, trusted }) {
      if (trusted) {
        q.report.run(rivalryId, team, gifId, trusted.weight, nowMs);
        return { status: 'counted' };
      }
      db.exec('BEGIN IMMEDIATE');
      try {
        if (lastReportPurgeDay !== day) {
          q.purgeReports.run(day);
          q.purgeReportSeen.run(day);
          lastReportPurgeDay = day;
        }
        const bucket = q.getReportBucket.get(ipHash) as Bucket | undefined;
        const taken = takeToken(bucket, nowMs, REPORT_RATE);
        q.putReportBucket.run(
          ipHash,
          day,
          taken.next.tokens,
          taken.next.updatedMs,
          taken.next.count,
        );
        const first =
          taken.allowed && Number(q.seeReport.run(rivalryId, team, gifId, ipHash, day).changes) > 0;
        if (first) q.report.run(rivalryId, team, gifId, 1, nowMs);
        db.exec('COMMIT');
        if (!taken.allowed) return { status: 'rate-limited', reason: taken.reason };
        return first ? { status: 'counted' } : { status: 'duplicate' };
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },

    gifReports() {
      const rows = q.reports.all() as unknown as (Omit<GifReportRow, 'lastReport'> & {
        lastMs: number;
      })[];
      return rows.map(({ lastMs, ...row }) => ({
        ...row,
        lastReport: new Date(lastMs).toISOString(),
      }));
    },

    reportedGifIds(rivalryId, team, minReports) {
      const rows = q.reportedIds.all(rivalryId, team, minReports) as unknown as { gifId: string }[];
      return rows.map((r) => r.gifId);
    },

    rivalryCounts(idPrefix) {
      const rows = idPrefix ? q.prefix.all(likePrefix(idPrefix)) : q.all.all();
      return rows as unknown as RivalryCounts[];
    },

    close() {
      db.close();
    },
  };
}
