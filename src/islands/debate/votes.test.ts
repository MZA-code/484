import { describe, expect, it, vi } from 'vitest';
import { readPairResult, sendVote } from './votes';

const payload = { rivalryId: 'heros-batman-superman', team: 'a', category: 'mix' } as const;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('readPairResult', () => {
  it('reads the pair numbers, even when rate-limited', async () => {
    expect(await readPairResult(json({ counted: true, chosenVotes: 3, totalVotes: 7 }))).toEqual({
      chosenVotes: 3,
      totalVotes: 7,
    });
    expect(
      await readPairResult(json({ counted: false, chosenVotes: 1, totalVotes: 2 }, 429)),
    ).toEqual({
      chosenVotes: 1,
      totalVotes: 2,
    });
  });

  it('reads the three choices when the counts add up', async () => {
    const body = { chosenVotes: 2, totalVotes: 10, aVotes: 5, bVotes: 3, noneVotes: 2 };
    expect(await readPairResult(json(body))).toEqual({
      chosenVotes: 2,
      totalVotes: 10,
      split: { a: 5, b: 3, none: 2 },
    });
    // Détail incohérent : ignoré, le pourcentage reste utilisable.
    const wrong = { ...body, noneVotes: 9 };
    expect(await readPairResult(json(wrong))).toEqual({ chosenVotes: 2, totalVotes: 10 });
  });

  it('returns null for errors and nonsense', async () => {
    expect(await readPairResult(json({ error: 'votes-disabled' }, 503))).toBeNull();
    expect(await readPairResult(json({ chosenVotes: 'x', totalVotes: 2 }))).toBeNull();
    expect(await readPairResult(json({ chosenVotes: 5, totalVotes: 2 }))).toBeNull();
  });
});

describe('sendVote', () => {
  it('posts the vote in the background with keepalive', async () => {
    const fetchMock = vi.fn(async () => json({ counted: true, chosenVotes: 1, totalVotes: 1 }));
    expect(await sendVote(payload, fetchMock as unknown as typeof fetch)).toEqual({
      chosenVotes: 1,
      totalVotes: 1,
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/vote');
    expect(init).toMatchObject({ method: 'POST', keepalive: true });
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });

  it('never throws when the network fails', async () => {
    const failing = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await sendVote(payload, failing as unknown as typeof fetch)).toBeNull();
  });

  it('gives up displaying after the timeout', async () => {
    vi.useFakeTimers();
    const never = vi.fn(() => new Promise<Response>(() => {}));
    const result = sendVote(payload, never as unknown as typeof fetch, 1500);
    vi.advanceTimersByTime(1500);
    expect(await result).toBeNull();
    vi.useRealTimers();
  });
});
