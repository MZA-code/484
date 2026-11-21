/**
 * Stockage des votes dans SQLite (module `node:sqlite` intégré à Node, rien à installer).
 *
 * Tables :
 * - contenders(id, wins, losses)
 * - pairs(a_id, b_id, a_wins, b_wins) : paire stockée triée (a_id < b_id)
 * - rate_limits(ip_hash, day, tokens, updated_ms, count) : empreintes d'IP, jamais d'IP en clair
 *
 * L'interface `VoteStore` isole le reste du code de SQLite (passage à MySQL possible).
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { ContenderCounts, PairCounts } from './ranking';
import { takeToken, type Bucket } from './rate-limit';

export interface VoteInput {
  winnerId: string;
  loserId: string;
  ipHash: string;
  day: string;
  nowMs: number;
}

/** Votes de la paire, vus depuis le choix du visiteur. */
export interface PairResult {
  chosenVotes: number;
  totalVotes: number;
}

export type VoteOutcome =
  | { status: 'counted'; pair: PairResult }
  | { status: 'rate-limited'; reason: 'burst' | 'daily'; pair: PairResult };

export interface VoteStore {
  recordVote(input: VoteInput): VoteOutcome;
  /** Compteurs bruts, filtrés sur un préfixe d'identifiant (« robots- ») ou tous. */
  contenderCounts(idPrefix: string | null): ContenderCounts[];
  pairCounts(idPrefix: string | null, minVotes: number): PairCounts[];
  close(): void;
}

/** Migrations successives, appliquées une fois (suivies par `PRAGMA user_version`). */
const MIGRATIONS = [
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
    win: db.prepare(
      'INSERT INTO contenders (id, wins) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET wins = wins + 1',
    ),
    loss: db.prepare(
      'INSERT INTO contenders (id, losses) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET losses = losses + 1',
    ),
    pairA: db.prepare(
      `INSERT INTO pairs (a_id, b_id, a_wins) VALUES (?, ?, 1)
       ON CONFLICT(a_id, b_id) DO UPDATE SET a_wins = a_wins + 1`,
    ),
    pairB: db.prepare(
      `INSERT INTO pairs (a_id, b_id, b_wins) VALUES (?, ?, 1)
       ON CONFLICT(a_id, b_id) DO UPDATE SET b_wins = b_wins + 1`,
    ),
    pair: db.prepare(
      'SELECT a_wins AS aWins, b_wins AS bWins FROM pairs WHERE a_id = ? AND b_id = ?',
    ),
    contendersAll: db.prepare('SELECT id, wins, losses FROM contenders'),
    contendersPrefix: db.prepare(
      `SELECT id, wins, losses FROM contenders WHERE id LIKE ? ESCAPE '\\'`,
    ),
    pairsAll: db.prepare(
      'SELECT a_id AS aId, b_id AS bId, a_wins AS aWins, b_wins AS bWins FROM pairs WHERE a_wins + b_wins >= ?',
    ),
    pairsPrefix: db.prepare(
      `SELECT a_id AS aId, b_id AS bId, a_wins AS aWins, b_wins AS bWins FROM pairs
       WHERE a_wins + b_wins >= ? AND a_id LIKE ? ESCAPE '\\' AND b_id LIKE ? ESCAPE '\\'`,
    ),
  };

  let lastPurgeDay = '';

  function pairResult(winnerId: string, loserId: string): PairResult {
    const [a, b] = winnerId < loserId ? [winnerId, loserId] : [loserId, winnerId];
    const row = q.pair.get(a, b) as { aWins: number; bWins: number } | undefined;
    if (!row) return { chosenVotes: 0, totalVotes: 0 };
    return {
      chosenVotes: winnerId === a ? row.aWins : row.bWins,
      totalVotes: row.aWins + row.bWins,
    };
  }

  return {
    recordVote({ winnerId, loserId, ipHash, day, nowMs }) {
      db.exec('BEGIN IMMEDIATE');
      try {
        // Ménage des empreintes des jours précédents (une fois par jour suffit).
        if (lastPurgeDay !== day) {
          q.purge.run(day);
          lastPurgeDay = day;
        }
        const taken = takeToken(q.getBucket.get(ipHash) as Bucket | undefined, nowMs);
        q.putBucket.run(ipHash, day, taken.next.tokens, taken.next.updatedMs, taken.next.count);

        if (taken.allowed) {
          q.win.run(winnerId);
          q.loss.run(loserId);
          if (winnerId < loserId) q.pairA.run(winnerId, loserId);
          else q.pairB.run(loserId, winnerId);
        }
        const pair = pairResult(winnerId, loserId);
        db.exec('COMMIT');
        return taken.allowed
          ? { status: 'counted', pair }
          : { status: 'rate-limited', reason: taken.reason, pair };
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },

    contenderCounts(idPrefix) {
      const rows = idPrefix ? q.contendersPrefix.all(likePrefix(idPrefix)) : q.contendersAll.all();
      return rows as unknown as ContenderCounts[];
    },

    pairCounts(idPrefix, minVotes) {
      const rows = idPrefix
        ? q.pairsPrefix.all(minVotes, likePrefix(idPrefix), likePrefix(idPrefix))
        : q.pairsAll.all(minVotes);
      return rows as unknown as PairCounts[];
    },

    close() {
      db.close();
    },
  };
}
