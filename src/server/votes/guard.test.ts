import { describe, expect, it } from 'vitest';
import { checkWriteRequest, pickClientIp, trustedHops } from './guard';

const CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 6a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36';

const request = (headers: Record<string, string>) => new Headers(headers);
const browser = {
  origin: 'https://team484.fr',
  host: 'team484.fr',
  'content-type': 'application/json',
  'user-agent': CHROME,
};

describe('write request guard', () => {
  it('lets a real browser on the site through', () => {
    expect(checkWriteRequest(request(browser), 'http://127.0.0.1/api/vote')).toBeNull();
  });

  it('compares the origin with the host asked through the proxy', () => {
    const headers = { ...browser, host: '127.0.0.1:3000', 'x-forwarded-host': 'team484.fr' };
    expect(checkWriteRequest(request(headers), 'http://127.0.0.1:3000/api/vote')).toBeNull();
  });

  it('refuses requests without origin or from another site', () => {
    const noOrigin: Record<string, string> = { ...browser };
    delete noOrigin.origin;
    expect(checkWriteRequest(request(noOrigin), 'https://team484.fr/api/vote')?.error).toBe(
      'forbidden-origin',
    );
    for (const origin of ['https://evil.example', 'null', 'pas une url']) {
      expect(
        checkWriteRequest(request({ ...browser, origin }), 'https://team484.fr/api/vote')?.status,
      ).toBe(403);
    }
  });

  it('requires a JSON body', () => {
    const form = { ...browser, 'content-type': 'application/x-www-form-urlencoded' };
    expect(checkWriteRequest(request(form), 'https://team484.fr/api/vote')).toEqual({
      status: 415,
      error: 'json-required',
    });
  });

  it('refuses scripts and automated browsers', () => {
    for (const agent of [
      '',
      'curl/8.5.0',
      'python-requests/2.32',
      'Go-http-client/2.0',
      'axios/1.7',
      'node-fetch/1.0',
      'Mozilla/5.0 HeadlessChrome/131.0',
      'Mozilla/5.0 (compatible; Googlebot/2.1)',
    ]) {
      const headers = { ...browser, 'user-agent': agent };
      expect(checkWriteRequest(request(headers), 'https://team484.fr/api/vote')?.error).toBe(
        'automated-client',
      );
    }
  });
});

describe('client IP behind a proxy', () => {
  it('reads TRUST_PROXY', () => {
    expect(trustedHops('true')).toBe(1);
    expect(trustedHops('2')).toBe(2);
    expect(trustedHops('false')).toBe(0);
    expect(trustedHops(undefined)).toBe(0);
    expect(trustedHops('-1')).toBe(0);
  });

  it('ignores X-Forwarded-For without a trusted proxy', () => {
    expect(pickClientIp('1.2.3.4', '203.0.113.9', 0)).toBe('203.0.113.9');
  });

  it('takes the address written by our own proxy, not the ones sent by the visitor', () => {
    // Le visiteur envoie « 6.6.6.6 » inventé ; notre proxy ajoute sa vraie adresse à droite.
    expect(pickClientIp('6.6.6.6, 198.51.100.7', '10.0.0.1', 1)).toBe('198.51.100.7');
    expect(pickClientIp('198.51.100.7', '10.0.0.1', 1)).toBe('198.51.100.7');
    // Deux proxys de confiance : l'avant-dernière.
    expect(pickClientIp('6.6.6.6, 198.51.100.7, 10.0.0.2', '10.0.0.1', 2)).toBe('198.51.100.7');
  });

  it('falls back to the direct address when the header is missing', () => {
    expect(pickClientIp(null, '10.0.0.1', 1)).toBe('10.0.0.1');
    expect(pickClientIp(' , ', '10.0.0.1', 1)).toBe('10.0.0.1');
  });
});
