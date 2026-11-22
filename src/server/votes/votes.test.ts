import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { rankRivalries } from './ranking';
import { dayOf, hashIp, RATE, REPORT_RATE, takeToken } from './rate-limit';
import { createVoteService, GIF_REJECT_THRESHOLD, HALL_TTL_MS } from './service';
import { openSqliteStore, type VoteStore } from './store';

// ─── Classements ────────────────────────────────────────────────────────────

describe('rankRivalries', () => {
  const rows = [
    { id: 'tied', aVotes: 50, bVotes: 50, noneVotes: 0 },
    { id: 'close', aVotes: 6, bVotes: 5, noneVotes: 0 },
    { id: 'crushed', aVotes: 95, bVotes: 5, noneVotes: 0 },
    { id: 'clear', aVotes: 30, bVotes: 10, noneVotes: 0 },
    { id: 'tiny', aVotes: 2, bVotes: 0, noneVotes: 0 },
    { id: 'empty', aVotes: 0, bVotes: 0, noneVotes: 0 },
  ];

  it('lists the closest debates first, with enough votes', () => {
    const { closest } = rankRivalries(rows, { limit: 2 });
    expect(closest.map((r) => r.id)).toEqual(['tied', 'close']);
    expect(closest[0]).toMatchObject({ total: 100, aPercent: 50 });
  });

  it('lists landslides without repeating the closest ones', () => {
    const { landslides } = rankRivalries(rows, { limit: 2 });
    expect(landslides.map((r) => r.id)).toEqual(['crushed', 'clear']);
  });

  it('lists the most voted, small ones included, never empty ones', () => {
    const { popular } = rankRivalries(rows);
    expect(popular.map((r) => r.id)).toEqual(['crushed', 'tied', 'clear', 'close', 'tiny']);
  });

  it('splits every debate in three parts that add up to 100 %', () => {
    const [r] = rankRivalries([{ id: 'x', aVotes: 45, bVotes: 43, noneVotes: 12 }]).popular;
    expect(r).toMatchObject({ total: 100, aPercent: 45, nonePercent: 12, bPercent: 43 });
  });

  it('judges close and landslide debates on the two teams only', () => {
    const { closest, landslides, popular } = rankRivalries([
      // Beaucoup de « aucun des deux », mais A écrase B : c'est un débat écrasant.
      { id: 'meh', aVotes: 9, bVotes: 1, noneVotes: 90 },
      // Que des « aucun des deux » : ni serré ni écrasant, mais bien parmi les plus votés.
      { id: 'nobody', aVotes: 0, bVotes: 0, noneVotes: 40 },
      { id: 'tied', aVotes: 20, bVotes: 20, noneVotes: 0 },
    ]);
    expect(closest.map((r) => r.id)).toEqual(['tied', 'meh']);
    expect(landslides).toEqual([]);
    // À égalité de votes, l'ordre alphabétique départage.
    expect(popular.map((r) => r.id)).toEqual(['meh', 'nobody', 'tied']);
    const { landslides: only } = rankRivalries(
      [
        { id: 'meh', aVotes: 9, bVotes: 1, noneVotes: 90 },
        { id: 'tied', aVotes: 20, bVotes: 20, noneVotes: 0 },
      ],
      { limit: 1 },
    );
    expect(only.map((r) => r.id)).toEqual(['meh']);
  });

  it('never judges a debate on too few votes', () => {
    const { closest, landslides } = rankRivalries([
      { id: 'tiny', aVotes: 2, bVotes: 0, noneVotes: 0 },
    ]);
    expect(closest).toEqual([]);
    expect(landslides).toEqual([]);
  });
});

// ─── Limite de débit ────────────────────────────────────────────────────────

describe('rate limit', () => {
  it('hashes IPs: stable within a day, different across days and salts, never the raw IP', () => {
    const h = hashIp('203.0.113.7', 'salt', '2026-11-21');
    expect(h).toBe(hashIp('203.0.113.7', 'salt', '2026-11-21'));
    expect(h).not.toBe(hashIp('203.0.113.7', 'salt', '2026-11-22'));
    expect(h).not.toBe(hashIp('203.0.113.7', 'other', '2026-11-21'));
    expect(h).not.toContain('203');
    expect(h).toMatch(/^[0-9a-f]{32}$/);
  });

  it('allows a short burst, then about one vote per second', () => {
    let bucket;
    const results: boolean[] = [];
    for (let i = 0; i < RATE.burst + 1; i++) {
      const r = takeToken(bucket, 0);
      results.push(r.allowed);
      bucket = r.next;
    }
    expect(results).toEqual([...Array(RATE.burst).fill(true), false]);
    expect(takeToken(bucket, 999).allowed).toBe(false);
    expect(takeToken(bucket, 1000).allowed).toBe(true);
  });

  it('stops at the daily cap', () => {
    const r = takeToken({ tokens: RATE.burst, updatedMs: 0, count: RATE.daily }, 10_000);
    expect(r).toMatchObject({ allowed: false, reason: 'daily' });
  });

  it('formats days in UTC', () => {
    expect(dayOf(Date.UTC(2026, 10, 21, 23, 59))).toBe('2026-11-21');
  });
});

// ─── Stockage SQLite + service ──────────────────────────────────────────────

const rivalries = [
  { id: 'heros-batman-superman', category: 'heros' },
  { id: 'heros-joker-thanos', category: 'heros' },
  { id: 'bouffe-chat-chien', category: 'bouffe' },
];
const batman = { rivalryId: 'heros-batman-superman', team: 'a', category: 'heros' } as const;

let store: VoteStore | null = null;
afterEach(() => {
  store?.close();
  store = null;
});

function setup(start = Date.UTC(2026, 10, 21, 12)) {
  store = openSqliteStore(':memory:');
  let now = start;
  const service = createVoteService({
    store,
    salt: 'test-salt',
    rivalries,
    categoryIds: ['heros', 'bouffe'],
    universes: [{ id: 'univers-pop', categories: ['heros'] }],
    now: () => now,
  });
  return {
    service,
    store,
    tick: (ms: number) => {
      now += ms;
    },
  };
}

describe('vote service', () => {
  it('records votes and returns the numbers seen from the chosen team', () => {
    const { service } = setup();
    expect(service.vote(batman, '1.1.1.1')).toEqual({
      status: 200,
      body: {
        counted: true,
        chosenVotes: 1,
        totalVotes: 1,
        aVotes: 1,
        bVotes: 0,
        noneVotes: 0,
      },
    });
    expect(service.vote({ ...batman, team: 'b' }, '2.2.2.2').body).toMatchObject({
      counted: true,
      chosenVotes: 1,
      totalVotes: 2,
    });
    expect(service.vote({ ...batman, category: 'mix' }, '3.3.3.3').body).toMatchObject({
      counted: true,
      chosenVotes: 2,
      totalVotes: 3,
    });
  });

  it('stores one counter per rivalry', () => {
    const { service, store } = setup();
    service.vote(batman, 'a');
    service.vote({ ...batman, team: 'b' }, 'b');
    service.vote({ rivalryId: 'bouffe-chat-chien', team: 'b', category: 'bouffe' }, 'c');
    expect(store.rivalryCounts(null)).toEqual(
      expect.arrayContaining([
        { id: 'heros-batman-superman', aVotes: 1, bVotes: 1, noneVotes: 0 },
        { id: 'bouffe-chat-chien', aVotes: 0, bVotes: 1, noneVotes: 0 },
      ]),
    );
    expect(store.rivalryCounts('bouffe-')).toHaveLength(1);
  });

  it('rejects invalid votes', () => {
    const { service } = setup();
    const cases: [unknown, string][] = [
      [null, 'invalid-body'],
      [{ rivalryId: 'heros-batman-superman' }, 'invalid-body'],
      [{ ...batman, team: 'c' }, 'invalid-body'],
      [{ ...batman, rivalryId: 'heros-nope' }, 'unknown-rivalry'],
      [{ ...batman, category: 'pirates' }, 'unknown-category'],
      [{ ...batman, category: 'bouffe' }, 'category-mismatch'],
    ];
    for (const [body, error] of cases) {
      expect(service.vote(body, 'ip')).toEqual({ status: 400, body: { error } });
    }
  });

  it('counts one vote per rivalry, per visitor and per day', () => {
    const { service, tick } = setup();
    expect(service.vote(batman, '9.9.9.9').body).toMatchObject({ counted: true, chosenVotes: 1 });
    tick(10_000);
    // Le même visiteur insiste : il voit les chiffres, mais rien n'est ajouté.
    expect(service.vote(batman, '9.9.9.9')).toEqual({
      status: 200,
      body: expect.objectContaining({
        counted: false,
        reason: 'duplicate',
        chosenVotes: 1,
        totalVotes: 1,
      }),
    });
    expect(service.vote({ ...batman, team: 'b' }, '9.9.9.9').body).toMatchObject({
      counted: false,
      totalVotes: 1,
    });
    // Une autre rivalité, ou un autre visiteur, comptent normalement.
    expect(
      service.vote({ rivalryId: 'heros-joker-thanos', team: 'a', category: 'heros' }, '9.9.9.9')
        .body,
    ).toMatchObject({ counted: true });
    expect(service.vote(batman, '8.8.8.8').body).toMatchObject({ counted: true, totalVotes: 2 });
    // Le lendemain, le visiteur peut revoter.
    tick(24 * 3600_000);
    expect(service.vote(batman, '9.9.9.9').body).toMatchObject({ counted: true, totalVotes: 3 });
  });

  it('counts « aucun des deux » as a third choice', () => {
    const { service, store } = setup();
    service.vote(batman, '1.1.1.1');
    service.vote({ ...batman, team: 'b' }, '2.2.2.2');
    expect(service.vote({ ...batman, team: 'none' }, '3.3.3.3')).toEqual({
      status: 200,
      body: {
        counted: true,
        chosenVotes: 1,
        totalVotes: 3,
        aVotes: 1,
        bVotes: 1,
        noneVotes: 1,
      },
    });
    // Le même visiteur ne peut pas ensuite voter pour une team : un seul choix par jour.
    expect(service.vote(batman, '3.3.3.3').body).toMatchObject({ counted: false });
    expect(store.rivalryCounts(null)).toEqual([
      { id: 'heros-batman-superman', aVotes: 1, bVotes: 1, noneVotes: 1 },
    ]);
    expect(service.vote({ ...batman, team: 'c' }, '4.4.4.4').status).toBe(400);
  });

  it('rate-limits a flood from the same IP but still answers with the numbers', () => {
    const { service } = setup();
    const statuses = Array.from(
      { length: RATE.burst + 2 },
      () => service.vote(batman, '9.9.9.9').status,
    );
    expect(statuses.filter((s) => s === 200)).toHaveLength(RATE.burst);
    expect(service.vote(batman, '9.9.9.9')).toEqual({
      status: 429,
      body: expect.objectContaining({
        counted: false,
        reason: 'burst',
        chosenVotes: 1,
        totalVotes: 1,
      }),
    });
    expect(service.vote(batman, '8.8.8.8').status).toBe(200);
  });

  it('builds the hall of fame per category and caches it for 60 s', () => {
    const { service, tick } = setup();
    for (let i = 0; i < 12; i++)
      service.vote({ ...batman, team: i % 2 ? 'a' : 'b' }, `10.0.0.${i}`);
    service.vote({ rivalryId: 'bouffe-chat-chien', team: 'a', category: 'mix' }, '10.0.1.1');

    const heros = service.hallOfFame('heros').body as {
      totalVotes: number;
      closest: unknown[];
      popular: { id: string }[];
    };
    expect(heros.totalVotes).toBe(12);
    expect(heros.closest).toEqual([
      {
        id: 'heros-batman-superman',
        aVotes: 6,
        bVotes: 6,
        noneVotes: 0,
        total: 12,
        aPercent: 50,
        nonePercent: 0,
        bPercent: 50,
      },
    ]);
    expect(heros.popular.map((r) => r.id)).toEqual(['heros-batman-superman']);
    expect((service.hallOfFame(null).body as { totalVotes: number }).totalVotes).toBe(13);

    service.vote(batman, '10.0.2.2');
    expect((service.hallOfFame('heros').body as { totalVotes: number }).totalVotes).toBe(12);
    tick(HALL_TTL_MS + 1);
    expect((service.hallOfFame('heros').body as { totalVotes: number }).totalVotes).toBe(13);
  });

  it('accepts votes and filters the hall of fame by universe', () => {
    const { service } = setup();
    expect(service.vote({ ...batman, category: 'univers-pop' }, '1.1.1.1').status).toBe(200);
    expect(
      service.vote(
        { rivalryId: 'bouffe-chat-chien', team: 'a', category: 'univers-pop' },
        '2.2.2.2',
      ),
    ).toEqual({ status: 400, body: { error: 'category-mismatch' } });
    service.vote({ rivalryId: 'bouffe-chat-chien', team: 'a', category: 'bouffe' }, '3.3.3.3');
    expect((service.hallOfFame('univers-pop').body as { totalVotes: number }).totalVotes).toBe(1);
    expect((service.hallOfFame('mix').body as { totalVotes: number }).totalVotes).toBe(2);
  });

  it('rejects an unknown category in the hall of fame', () => {
    const { service } = setup();
    expect(service.hallOfFame('pirates').status).toBe(400);
  });
});

describe('gif reports', () => {
  const report = { teamId: 'heros-batman-superman/a', gifId: 'xT0xeJpnrWC4XWblEk' };

  it('counts reports per GIF, never who sent them', () => {
    const { service, store } = setup();
    expect(service.reportGif(report, '1.1.1.1')).toEqual({ status: 200, body: { counted: true } });
    service.reportGif(report, '2.2.2.2');
    service.reportGif({ ...report, teamId: 'bouffe-chat-chien/b', gifId: 'other1' }, '3.3.3.3');
    expect(store.gifReports()).toEqual([
      expect.objectContaining({
        rivalryId: 'heros-batman-superman',
        team: 'a',
        gifId: 'xT0xeJpnrWC4XWblEk',
        reports: 2,
      }),
      expect.objectContaining({ rivalryId: 'bouffe-chat-chien', team: 'b', reports: 1 }),
    ]);
    expect(JSON.stringify(store.gifReports())).not.toContain('1.1.1.1');
  });

  it('rejects malformed or unknown teams and GIF ids', () => {
    const { service } = setup();
    for (const body of [
      null,
      {},
      { ...report, teamId: 'heros-batman-superman' },
      { ...report, teamId: 'heros-batman-superman/c' },
      { ...report, gifId: '../../etc' },
      { ...report, gifId: '' },
    ]) {
      expect(service.reportGif(body, 'ip').status).toBe(400);
    }
    expect(service.reportGif({ ...report, teamId: 'pirates-x/a' }, 'ip').body).toEqual({
      error: 'unknown-rivalry',
    });
  });

  it('rate-limits reports separately from votes, and more strictly', () => {
    const { service, store, tick } = setup();
    const statuses = Array.from(
      { length: REPORT_RATE.burst + 1 },
      () => service.reportGif(report, '9.9.9.9').status,
    );
    expect(statuses).toEqual([...Array<number>(REPORT_RATE.burst).fill(200), 429]);
    // Les votes du même visiteur ne sont pas touchés.
    expect(service.vote(batman, '9.9.9.9').status).toBe(200);
    tick(60_000);
    expect(service.reportGif(report, '9.9.9.9').status).toBe(200);
    // Un seul signalement compté : c'est toujours le même visiteur, le même jour.
    expect(store.gifReports()[0]?.reports).toBe(1);
  });

  it('counts a GIF report once per visitor and per day', () => {
    const { service, store, tick } = setup();
    expect(service.reportGif(report, '1.1.1.1').body).toEqual({ counted: true });
    expect(service.reportGif(report, '1.1.1.1')).toEqual({
      status: 200,
      body: { counted: false, reason: 'duplicate' },
    });
    service.reportGif(report, '2.2.2.2');
    tick(24 * 3600_000);
    service.reportGif(report, '1.1.1.1');
    expect(store.gifReports()[0]?.reports).toBe(3);
  });

  it('rejects a GIF only once enough distinct visitors reported it', () => {
    const { service } = setup();
    const ips = Array.from({ length: GIF_REJECT_THRESHOLD }, (_, i) => `10.0.0.${i}`);
    ips.slice(0, -1).forEach((ip) => service.reportGif(report, ip));
    // Le même visiteur qui insiste ne suffit pas.
    service.reportGif(report, ips[0] as string);
    expect(service.rejectedGifs('heros-batman-superman', 'a').size).toBe(0);
    service.reportGif(report, ips.at(-1) as string);
    expect(service.rejectedGifs('heros-batman-superman', 'a')).toEqual(new Set([report.gifId]));
    // Les autres teams ne sont pas touchées.
    expect(service.rejectedGifs('heros-batman-superman', 'b').size).toBe(0);
    expect(service.rejectedGifs('pirates-x', 'a').size).toBe(0);
  });

  it('lets the editor (admin mode) reject a GIF at once, without any limit', () => {
    const { service } = setup();
    // Bien au-delà de la limite d'un visiteur, toujours depuis la même adresse.
    for (let i = 0; i < REPORT_RATE.daily + 5; i++) {
      const gifId = `gif${i}`;
      expect(service.reportGif({ ...report, gifId }, '9.9.9.9', true)).toEqual({
        status: 200,
        body: { counted: true, rejected: true },
      });
      expect(service.rejectedGifs('heros-batman-superman', 'a').has(gifId)).toBe(true);
    }
    // Un visiteur ordinaire reste limité, lui.
    const statuses = Array.from(
      { length: REPORT_RATE.burst + 1 },
      (_, i) => service.reportGif({ ...report, gifId: `v${i}` }, '9.9.9.9').status,
    );
    expect(statuses.at(-1)).toBe(429);
  });

  it('lists reports only with the right token', () => {
    const { service } = setup();
    service.reportGif(report, '1.1.1.1');
    expect(service.gifReports('Bearer secret', undefined).status).toBe(404);
    expect(service.gifReports(null, 'secret').status).toBe(401);
    expect(service.gifReports('Bearer wrong!', 'secret').status).toBe(401);
    const ok = service.gifReports('Bearer secret', 'secret');
    expect(ok.status).toBe(200);
    expect((ok.body as { reports: unknown[] }).reports).toHaveLength(1);
  });
});

describe('sqlite file', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });
  const tempFile = () => {
    const dir = mkdtempSync(join(tmpdir(), 'votes-'));
    dirs.push(dir);
    return join(dir, 'votes.sqlite');
  };

  it('forgets fingerprints from previous days', () => {
    const file = tempFile();
    let now = Date.UTC(2026, 10, 21, 12);
    const fileStore = openSqliteStore(file);
    const service = createVoteService({
      store: fileStore,
      salt: 's',
      rivalries,
      categoryIds: ['heros', 'bouffe'],
      now: () => now,
    });
    service.vote(batman, '1.1.1.1');
    service.vote(batman, '2.2.2.2');
    const fingerprints = () => {
      const db = new DatabaseSync(file);
      const rows = db.prepare('SELECT ip_hash, day FROM rate_limits').all() as {
        ip_hash: string;
        day: string;
      }[];
      db.close();
      return rows;
    };
    expect(fingerprints()).toHaveLength(2);
    expect(fingerprints().some((r) => r.ip_hash.includes('1.1.1.1'))).toBe(false);
    now += 24 * 3600_000;
    service.vote(batman, '3.3.3.3');
    expect(fingerprints()).toEqual([{ ip_hash: expect.any(String), day: '2026-11-22' }]);
    fileStore.close();
  });

  it('migrates a database from the duel era', () => {
    const file = tempFile();
    // Base créée avant le pivot : version 1, tables des duels.
    const old = new DatabaseSync(file);
    old.exec(`CREATE TABLE contenders (id TEXT PRIMARY KEY, wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0) STRICT;
      CREATE TABLE pairs (a_id TEXT NOT NULL, b_id TEXT NOT NULL, a_wins INTEGER NOT NULL DEFAULT 0, b_wins INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (a_id, b_id)) STRICT;
      CREATE TABLE rate_limits (ip_hash TEXT PRIMARY KEY, day TEXT NOT NULL, tokens REAL NOT NULL, updated_ms INTEGER NOT NULL, count INTEGER NOT NULL) STRICT;
      CREATE INDEX rate_limits_day ON rate_limits(day);
      PRAGMA user_version = 1;`);
    old.close();
    const migrated = openSqliteStore(file);
    expect(migrated.rivalryCounts(null)).toEqual([]);
    migrated.recordVote({
      rivalryId: 'heros-batman-superman',
      team: 'b',
      ipHash: 'h',
      day: '2026-11-21',
      nowMs: 0,
    });
    expect(migrated.rivalryCounts(null)).toEqual([
      { id: 'heros-batman-superman', aVotes: 0, bVotes: 1, noneVotes: 0 },
    ]);
    migrated.close();
    const check = new DatabaseSync(file);
    const tables = (
      check.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as {
        name: string;
      }[]
    ).map((t) => t.name);
    check.close();
    expect(tables.sort()).toEqual([
      'gif_report_seen',
      'gif_reports',
      'rate_limits',
      'report_limits',
      'rivalry_votes',
      'vote_seen',
    ]);
  });
});
