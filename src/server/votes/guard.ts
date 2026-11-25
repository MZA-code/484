/**
 * Filtre des requêtes qui écrivent (les votes), avant même la limite de débit.
 *
 * Il écarte les abus les plus simples : formulaire posté depuis un autre site, script qui
 * n'imite pas un navigateur, en-tête X-Forwarded-For inventé pour changer d'adresse IP.
 * Un robot déterminé peut imiter un navigateur : la vraie protection reste la limite par
 * visiteur (empreinte d'IP) et le « un vote par rivalité et par jour ».
 */

export interface Rejection {
  status: number;
  error: string;
}

/** Outils en ligne de commande, bibliothèques HTTP, navigateurs pilotés, robots déclarés. */
const AUTOMATED_AGENT =
  /curl|wget|python|httpie|go-http|java\/|okhttp|axios|node-fetch|undici|libwww|scrapy|aiohttp|headless|phantomjs|puppeteer|playwright|selenium|\bbot\b|bot\/|crawler|spider/i;

/** L'hôte demandé par le navigateur (Host, ou X-Forwarded-Host derrière un proxy). */
function requestedHost(headers: Headers, requestUrl: string): string {
  return headers.get('x-forwarded-host') ?? headers.get('host') ?? new URL(requestUrl).host;
}

function isSameSite(origin: string | null, headers: Headers, requestUrl: string): boolean {
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
export function checkWriteRequest(headers: Headers, requestUrl: string): Rejection | null {
  if (!isSameSite(headers.get('origin'), headers, requestUrl)) {
    return { status: 403, error: 'forbidden-origin' };
  }

  const type = headers.get('content-type')?.toLowerCase() ?? '';
  if (!type.startsWith('application/json')) return { status: 415, error: 'json-required' };

  const agent = headers.get('user-agent') ?? '';
  if (!agent || AUTOMATED_AGENT.test(agent)) return { status: 403, error: 'automated-client' };
  return null;
}

/**
 * Nombre de proxys de confiance devant le serveur, depuis TRUST_PROXY :
 * « true » = 1, un nombre = ce nombre, autre chose = 0 (pas de proxy).
 */
export function trustedHops(setting: string | undefined): number {
  if (setting === 'true') return 1;
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
export function pickClientIp(forwardedFor: string | null, direct: string, hops: number): string {
  if (hops <= 0) return direct;
  const chain = (forwardedFor ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (chain.length === 0) return direct;
  return chain[Math.max(0, chain.length - hops)] ?? direct;
}
