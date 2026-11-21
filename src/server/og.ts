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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import satori from 'satori';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { formatText } from '../lib/format';
import { hashString, teamColors } from '../lib/color';

import { OG_HEIGHT, OG_WIDTH } from '../lib/og-path';

const INK = '#121212';
const FG = '#F5F1E8';
const MUTED = '#B9B4A8';
const YELLOW = '#FFD23F';
const PINK = '#FF6FA8';

/** Nœud satori minimal (équivalent d'un élément JSX). */
interface OgNode {
  type: string;
  props: { style?: Record<string, unknown>; children?: OgChild | OgChild[] };
}
type OgChild = OgNode | string;

const el = (style: Record<string, unknown>, children?: OgChild | OgChild[]): OgNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, ...(children === undefined ? {} : { children }) },
});

export interface OgTexts {
  logo: string;
  name: string;
  team: string;
  vs: string;
  cta: string;
  domain: string;
  heroLines: readonly [string, string, string];
}

export interface OgDebate {
  id: string;
  category: string;
  a: string;
  b: string;
}

/** Taille du nom d'une team selon sa longueur, pour qu'il tienne en deux lignes au plus. */
function nameSize(name: string): number {
  if (name.length > 26) return 50;
  if (name.length > 16) return 62;
  if (name.length > 10) return 76;
  return 92;
}

function header(texts: OgTexts, right?: string): OgNode {
  return el({ alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
    el({ alignItems: 'center', gap: 16 }, [
      el({ background: YELLOW, color: INK, padding: '0 14px', fontSize: 46 }, texts.logo),
      el({ color: FG, fontSize: 46, textTransform: 'uppercase' }, texts.name),
    ]),
    ...(right
      ? [
          el(
            {
              color: YELLOW,
              fontFamily: 'Space Mono',
              fontSize: 24,
              fontWeight: 700,
              textTransform: 'uppercase',
            },
            right,
          ),
        ]
      : []),
  ]);
}

function footer(texts: OgTexts): OgNode {
  return el(
    { color: MUTED, fontFamily: 'Space Mono', fontSize: 26, fontWeight: 700 },
    formatText(texts.cta, { domain: texts.domain }),
  );
}

function teamCard(name: string, color: string, texts: OgTexts): OgNode {
  return el(
    {
      flex: 1,
      minWidth: 0,
      height: 290,
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 30,
      background: color,
      color: INK,
      boxShadow: `10px 10px 0 ${FG}`,
    },
    [
      el(
        {
          alignSelf: 'flex-start',
          padding: '4px 12px',
          background: INK,
          color: FG,
          fontFamily: 'Space Mono',
          fontSize: 22,
          fontWeight: 700,
        },
        texts.team.toUpperCase(),
      ),
      el(
        { fontSize: nameSize(name), lineHeight: 1, textTransform: 'uppercase' },
        name.toUpperCase(),
      ),
    ],
  );
}

/** Marges de l'image. satori compte les marges en plus de la taille : on les retire du cadre. */
const PAD_X = 56;
const PAD_Y = 48;
const frame = {
  width: OG_WIDTH - 2 * PAD_X,
  height: OG_HEIGHT - 2 * PAD_Y,
  padding: `${PAD_Y}px ${PAD_X}px`,
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: INK,
  fontFamily: 'Anton',
};

function debateLayout(debate: OgDebate, texts: OgTexts): OgNode {
  const [colorA, colorB] = teamColors(debate.id);
  return el(
    {
      ...frame,
    },
    [
      header(texts, debate.category),
      el({ alignItems: 'center', gap: 28, width: '100%' }, [
        teamCard(debate.a, colorA, texts),
        el(
          {
            width: 104,
            height: 104,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 52,
            background: FG,
            color: INK,
            fontSize: 44,
          },
          texts.vs.toUpperCase(),
        ),
        teamCard(debate.b, colorB, texts),
      ]),
      footer(texts),
    ],
  );
}

function siteLayout(texts: OgTexts): OgNode {
  return el({ ...frame }, [
    header(texts),
    el(
      { flexDirection: 'column', fontSize: 92, lineHeight: 1.08, textTransform: 'uppercase' },
      texts.heroLines.map((line, i) => el({ color: i === 2 ? PINK : FG }, line.toUpperCase())),
    ),
    footer(texts),
  ]);
}

// ─── Rendu ──────────────────────────────────────────────────────────────────

const require = createRequire(import.meta.url);
let ready: Promise<{ fonts: Parameters<typeof satori>[1]['fonts'] }> | null = null;

/** Charge les polices et le moteur WebAssembly une seule fois. */
function setup() {
  ready ??= (async () => {
    try {
      await initWasm(readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm')));
    } catch (error) {
      // Déjà initialisé (rechargement du module en développement) : le moteur est prêt.
      if (!(error instanceof Error && error.message.includes('Already initialized'))) throw error;
    }
    const font = (file: string) => readFileSync(require.resolve(file));
    return {
      fonts: [
        {
          name: 'Anton',
          data: font('@fontsource/anton/files/anton-latin-400-normal.woff'),
          weight: 400,
        },
        {
          name: 'Anton',
          data: font('@fontsource/anton/files/anton-latin-ext-400-normal.woff'),
          weight: 400,
        },
        {
          name: 'Space Mono',
          data: font('@fontsource/space-mono/files/space-mono-latin-700-normal.woff'),
          weight: 700,
        },
      ] as Parameters<typeof satori>[1]['fonts'],
    };
  })();
  return ready;
}

async function render(node: OgNode): Promise<Uint8Array> {
  const { fonts } = await setup();
  const svg = await satori(node as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}

/** Cache mémoire des dernières images, et des rendus en cours (un seul rendu par image). */
const CACHE_SIZE = 64;
const cache = new Map<string, Promise<Uint8Array>>();

/** Lit l'image sur disque, sinon la dessine et l'y range. Le disque est facultatif : une erreur n'empêche pas l'image. */
async function fromDisk(dir: string | null, node: OgNode): Promise<Uint8Array> {
  const file = dir ? join(dir, `${hashString(JSON.stringify(node)).toString(36)}.png`) : null;
  if (file) {
    try {
      return readFileSync(file);
    } catch {
      // Pas encore dessinée.
    }
  }
  const png = await render(node);
  if (dir && file) {
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, png);
    } catch (error) {
      console.warn('[og] cache disque indisponible :', error);
    }
  }
  return png;
}

function cached(key: string, make: () => Promise<Uint8Array>): Promise<Uint8Array> {
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const promise = make().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, promise);
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value as string);
  return promise;
}

export function renderDebateImage(
  debate: OgDebate,
  texts: OgTexts,
  cacheDir: string | null = null,
): Promise<Uint8Array> {
  const node = debateLayout(debate, texts);
  return cached(JSON.stringify(node), () => fromDisk(cacheDir, node));
}

export function renderSiteImage(
  texts: OgTexts,
  cacheDir: string | null = null,
): Promise<Uint8Array> {
  const node = siteLayout(texts);
  return cached(JSON.stringify(node), () => fromDisk(cacheDir, node));
}
