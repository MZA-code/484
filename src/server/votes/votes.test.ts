import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { closestDuels, rankContenders, wilson } from './ranking';
import { dayOf, hashIp, RATE, takeToken } from './rate-limit';
import { createVoteService, HALL_TTL_MS } from './service';
import { openSqliteStore, type VoteStore } from './store';

// ─── Classements ────────────────────────────────────────────────────────────

describe('wilson', () => {
  it('ranks a large sample above a tiny perfect one', () => {
    expect(wilson(80, 100).low).toBeGreaterThan(wilson(1, 1).low);
  });

  it('stays within [0, 1]', () => {
    for (const [w, n] of [
      [0, 1],
      [1, 1],
      [5, 10],
      [0, 0],
    ] as const) {
      const { low, high } = wilson(w, n);
      expect(low).toBeGreaterThanOrEqual(0);
      expect(high).toBeLessThanOrEqual(1);
      expect(low).toBeLessThanOrEqual(high);
    }
  });
});

describe('rankContenders', () => {
  const rows = [
    { id: 'lucky', wins: 1, losses: 0 },
    { id: 'champ', wins: 80, losses: 20 },
    { id: 'meh', wins: 50, losses: 50 },
    { id: 'loser', wins: 2, losses: 40 },
    { id: 'unlucky', wins: 0, losses: 2 },
    { id: 'never', wins: 0, losses: 0 },
  ];

  it('puts solid winners first and ignores contenders without votes', () => {
    const { top } = rankContenders(rows, { top: 3 });
    expect(top.map((r) => r.id)).toEqual(['champ', 'meh', 'lucky']);
    expect(top[0]).toMatchObject({ total: 100, winRate: 80 });
  });

  it('lists the unloved with enough votes, never someone from the top', () => {
    const { flop } = rankContenders(rows, { top: 2, flop: 5, flopMinVotes: 5 });
    expect(flop.map((r) => r.id)).toEqual(['loser']);
  });
});

describe('closestDuels', () => {
  it('sorts by relative margin, then by number of votes', () => {
    const duels = closestDuels(
      [
        { aId: 'a', bId: 'b', aWins: 50, bWins: 50 },
        { aId: 'c', bId: 'd', aWins: 6, bWins: 5 },
        { aId: 'e', bId: 'f', aWins: 5, bWins: 5 },
        { aId: 'g', bId: 'h', aWins: 90, bWins: 10 },
        { aId: 'i', bId: 'j', aWins: 2, bWins: 2 },
      ],
      { minVotes: 10 },
    );
    expect(duels.map((d) => d.aId)).toEqual(['a', 'e', 'c', 'g']);
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

const contenders = [
  { id: 'robots-hal', theme: 'robots' },
  { id: 'robots-r2', theme: 'robots' },
  { id: 'robots-wall-e', theme: 'robots' },
  { id: 'duos-doc-marty', theme: 'duos' },
];

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
    contenders,
    themeIds: ['robots', 'duos'],
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
  it('records a vote and returns the pair numbers', () => {
    const { service, tick } = setup();
    const first = service.vote(
      { winnerId: 'robots-hal', loserId: 'robots-r2', theme: 'robots' },
      '1.1.1.1',
    );
    expect(first).toEqual({ status: 200, body: { counted: true, chosenVotes: 1, totalVotes: 1 } });
    tick(2000);
    const second = service.vote(
      { winnerId: 'robots-r2', loserId: 'robots-hal', theme: 'robots' },
      '2.2.2.2',
    );
    expect(second.body).toEqual({ counted: true, chosenVotes: 1, totalVotes: 2 });
    tick(2000);
    const third = service.vote(
      { winnerId: 'robots-r2', loserId: 'robots-hal', theme: 'mix' },
      '3.3.3.3',
    );
    expect(third.body).toEqual({ counted: true, chosenVotes: 2, totalVotes: 3 });
  });

  it('stores each pair once, sorted, whatever the order', () => {
    const { service, store, tick } = setup();
    service.vote({ winnerId: 'robots-r2', loserId: 'robots-hal', theme: 'robots' }, 'a');
    tick(2000);
    service.vote({ winnerId: 'robots-hal', loserId: 'robots-r2', theme: 'robots' }, 'b');
    expect(store.pairCounts(null, 1)).toEqual([
      { aId: 'robots-hal', bId: 'robots-r2', aWins: 1, bWins: 1 },
    ]);
    expect(store.contenderCounts(null)).toEqual(
      expect.arrayContaining([
        { id: 'robots-hal', wins: 1, losses: 1 },
        { id: 'robots-r2', wins: 1, losses: 1 },
      ]),
    );
  });

  it('rejects invalid votes', () => {
    const { service } = setup();
    const cases: [unknown, string][] = [
      [null, 'invalid-body'],
      [{ winnerId: 'robots-hal' }, 'invalid-body'],
      [{ winnerId: 'nope', loserId: 'robots-r2', theme: 'robots' }, 'unknown-contender'],
      [{ winnerId: 'robots-hal', loserId: 'robots-hal', theme: 'robots' }, 'same-contender'],
      [{ winnerId: 'robots-hal', loserId: 'robots-r2', theme: 'pirates' }, 'unknown-theme'],
      [{ winnerId: 'robots-hal', loserId: 'duos-doc-marty', theme: 'robots' }, 'theme-mismatch'],
    ];
    for (const [body, error] of cases) {
      expect(service.vote(body, 'ip')).toEqual({ status: 400, body: { error } });
    }
  });

  it('rate-limits a flood from the same IP but still answers with the numbers', () => {
    const { service } = setup();
    const vote = () =>
      service.vote({ winnerId: 'robots-hal', loserId: 'robots-r2', theme: 'robots' }, '9.9.9.9');
    const statuses = Array.from({ length: RATE.burst + 2 }, () => vote().status);
    expect(statuses.filter((s) => s === 200)).toHaveLength(RATE.burst);
    expect(vote()).toEqual({
      status: 429,
      body: { counted: false, reason: 'burst', chosenVotes: RATE.burst, totalVotes: RATE.burst },
    });
    // Un autre visiteur n'est pas concerné.
    expect(
      service.vote({ winnerId: 'robots-hal', loserId: 'robots-r2', theme: 'robots' }, '8.8.8.8')
        .status,
    ).toBe(200);
  });

  it('builds the hall of fame per theme and caches it for 60 s', () => {
    const { service, tick } = setup();
    const ips = Array.from({ length: 12 }, (_, i) => `10.0.0.${i}`);
    ips.forEach((ip, i) =>
      service.vote(
        {
          winnerId: i % 2 ? 'robots-hal' : 'robots-r2',
          loserId: i % 2 ? 'robots-r2' : 'robots-hal',
          theme: 'robots',
        },
        ip,
      ),
    );
    service.vote(
      { winnerId: 'duos-doc-marty', loserId: 'robots-wall-e', theme: 'mix' },
      '10.0.1.1',
    );

    const robots = service.hallOfFame('robots').body as {
      totalVotes: number;
      top: { id: string }[];
      close: unknown[];
    };
    expect(robots.totalVotes).toBe(12);
    expect(robots.top.map((r) => r.id).sort()).toEqual(['robots-hal', 'robots-r2']);
    expect(robots.close).toEqual([
      { aId: 'robots-hal', bId: 'robots-r2', aWins: 6, bWins: 6, total: 12 },
    ]);

    const mix = service.hallOfFame(null).body as { totalVotes: number };
    expect(mix.totalVotes).toBe(13);

    // Cache : un nouveau vote n'apparaît qu'après 60 s.
    service.vote({ winnerId: 'robots-hal', loserId: 'robots-wall-e', theme: 'robots' }, '10.0.2.2');
    expect((service.hallOfFame('robots').body as { totalVotes: number }).totalVotes).toBe(12);
    tick(HALL_TTL_MS + 1);
    expect((service.hallOfFame('robots').body as { totalVotes: number }).totalVotes).toBe(13);
  });

  it('rejects an unknown theme in the hall of fame', () => {
    const { service } = setup();
    expect(service.hallOfFame('pirates').status).toBe(400);
  });

  it('forgets fingerprints from previous days', () => {
    const dir = mkdtempSync(join(tmpdir(), 'votes-'));
    const file = join(dir, 'votes.sqlite');
    let now = Date.UTC(2026, 10, 21, 12);
    const fileStore = openSqliteStore(file);
    const service = createVoteService({
      store: fileStore,
      salt: 's',
      contenders,
      themeIds: ['robots', 'duos'],
      now: () => now,
    });
    const body = { winnerId: 'robots-hal', loserId: 'robots-r2', theme: 'robots' };
    service.vote(body, '1.1.1.1');
    service.vote(body, '2.2.2.2');
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
    service.vote(body, '3.3.3.3');
    expect(fingerprints()).toEqual([{ ip_hash: expect.any(String), day: '2026-11-22' }]);
    fileStore.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
