/**
 * Mode console : jouer aux duels dans le terminal, avec le vrai moteur et les vrais contenus.
 *
 *   npm run play                      partie interactive (← → S T Q)
 *   npm run play -- --theme robots    choisir le thème de départ
 *   npm run play -- --seed 42         partie reproductible
 *   npm run play -- --auto 30         30 votes automatiques, puis le résumé (sans clavier)
 *
 * Il n'y a pas encore d'API de votes (phase 4) : les pourcentages sont simulés et signalés comme tels.
 * Les textes du jeu viennent de `content/` ; seule l'aide clavier, propre à cet outil, est ici.
 */
import { readFileSync } from 'node:fs';
import { emitKeypressEvents } from 'node:readline';
import { parseArgs } from 'node:util';
import { parseContent } from '../src/data/parse';
import {
  changeTheme,
  championSide,
  createCatalog,
  createGame,
  defaultRng,
  duelNumber,
  MIXED_THEME,
  nextQuip,
  randomInt,
  records,
  seededRng,
  shareOutcome,
  skipDuel,
  topContenders,
  vote,
  type GameContext,
  type GameState,
  type PairResult,
  type Side,
} from '../src/engine';
import { colorFor } from '../src/lib/color';
import { formatText, plural } from '../src/lib/format';

// ─── Contenus ───────────────────────────────────────────────────────────────

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8'));

const { contenders: catalogFile, ui } = parseContent(
  readJson('contenders.json'),
  readJson('ui-texts.fr.json'),
);
const byId = new Map(catalogFile.contenders.map((c) => [c.id, c]));
const themeLabels = new Map([
  [MIXED_THEME, ui.home.mixedTheme.label],
  ...catalogFile.themes.map((t) => [t.id, t.label] as const),
]);

const contender = (id: string) => {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown contender: ${id}`);
  return found;
};

// ─── Options ────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    theme: { type: 'string', default: MIXED_THEME },
    seed: { type: 'string' },
    auto: { type: 'string' },
  },
});

const rng = args.seed !== undefined ? seededRng(Number(args.seed)) : defaultRng;
const catalog = createCatalog(
  catalogFile.themes.map((t) => t.id),
  catalogFile.contenders,
);
const ctx: GameContext = {
  catalog,
  rng,
  milestones: Object.keys(ui.milestones).map(Number),
};

if (!catalog.pools.has(args.theme)) {
  console.error(`Thème inconnu : ${args.theme}. Thèmes : ${catalog.themeIds.join(', ')}`);
  process.exit(1);
}

// ─── Affichage ──────────────────────────────────────────────────────────────

const ansi = {
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
  italic: (s: string) => `\x1b[3m${s}\x1b[23m`,
  pink: (s: string) => `\x1b[38;2;255;111;168m${s}\x1b[39m`,
  /** Texte noir sur la couleur de la carte, comme sur le site. */
  card: (hex: string, s: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return `\x1b[48;2;${r};${g};${b}m\x1b[38;2;18;18;18m ${s} \x1b[0m`;
  },
};

function renderCard(state: GameState, id: string, side: Side): string[] {
  const c = contender(id);
  const origin =
    state.theme === MIXED_THEME
      ? `${(themeLabels.get(c.theme) ?? '').toUpperCase()} · ${c.origin}`
      : c.origin;
  const lines = [
    `${side === 'left' ? '←' : '→'}  ${ansi.dim(origin)}`,
    `   ${ansi.card(colorFor(id), ansi.bold(c.name.toUpperCase()))}`,
    `   ${ansi.italic(c.line)}`,
  ];
  if (championSide(state) === side) {
    lines.push(`   ${ansi.pink(plural(ui.duel.streakBadge, state.streak).toUpperCase())}`);
  }
  return lines;
}

function renderPanels(state: GameState): string[] {
  const top = topContenders(state);
  const rec = records(state, ctx);
  const lines = ['', ansi.bold('TON TOP 5')];
  if (top.length === 0) lines.push(ansi.dim('  (vide)'));
  top.forEach((t, i) => lines.push(`  ${i + 1}. ${contender(t.contenderId).name} — ${t.wins}`));
  lines.push('', ansi.bold('RECORDS'));
  lines.push(
    `  Plus longue série : ${rec.bestStreak ? `${contender(rec.bestStreak.contenderId).name} (${rec.bestStreak.length})` : '—'}`,
    `  Retraités invaincus : ${rec.retiredCount}`,
    `  Prétendants dans le thème : ${rec.poolSize}`,
  );
  return lines;
}

function render(state: GameState, banner: string[]): void {
  const out = [
    `${ansi.card('#FFD23F', ansi.bold('484'))} ${ansi.bold('LEQUEL TU PRÉFÈRES ?')}   ${ansi.dim(`[${themeLabels.get(state.theme)}]`)}`,
    '',
    `${ansi.bold(`DUEL N° ${duelNumber(state)}`)}  ${ansi.dim(ui.duel.subtitle)}`,
    '',
    ...renderCard(state, state.left, 'left'),
    '',
    `      ${ansi.pink(ansi.bold('VS'))}`,
    '',
    ...renderCard(state, state.right, 'right'),
    '',
    ...banner,
    ...renderPanels(state),
    '',
    ansi.dim(`← / → choisir · S « ${ui.duel.skip} » · T changer de thème · Q quitter`),
  ];
  console.clear();
  console.log(out.join('\n'));
}

// ─── Partie ─────────────────────────────────────────────────────────────────

/** Votes simulés tant que l'API n'existe pas (phase 4). Parfois moins de 5 votes, parfois en panne. */
function simulatePair(): PairResult | null {
  const roll = rng();
  if (roll < 0.05) return null;
  const totalVotes = roll < 0.15 ? randomInt(5, rng) : 5 + randomInt(400, rng);
  return { chosenVotes: Math.round(totalVotes * rng()), totalVotes };
}

function bar(percent: number, hex: string): string {
  const width = 30;
  const filled = Math.round((percent / 100) * width);
  // `ansi.card` ajoute une espace de chaque côté : on retire 2 pour garder la bonne largeur.
  const done = filled >= 2 ? ansi.card(hex, ' '.repeat(filled - 2)) : '';
  return done + ansi.dim('░'.repeat(width - (filled >= 2 ? filled : 0)));
}

function play(state: GameState, side: Side): { state: GameState; banner: string[] } {
  const result = vote(state, side, ctx);
  const voted = result.events.find((e) => e.type === 'voted');
  if (!voted) throw new Error('Vote without event');
  const winner = contender(voted.winnerId);
  const outcome = shareOutcome(simulatePair());
  const quip = nextQuip(result.state, ui.quips, outcome, rng);

  const choice = formatText(ui.duel.choice, { name: winner.name });
  const banner = [
    outcome.kind === 'share'
      ? `${ansi.bold(choice)} · ${formatText(ui.duel.share, { percent: outcome.percent })} ${ansi.dim('(simulé)')}`
      : ansi.bold(choice),
  ];
  if (outcome.kind === 'share') banner.push(bar(outcome.percent, colorFor(winner.id)));
  if (outcome.kind === 'first') banner.push(ui.duel.firstVote);
  banner.push(ansi.italic(quip.text));

  for (const event of result.events) {
    if (event.type === 'retired') {
      banner.push(
        '',
        ansi.pink(formatText(ui.duel.retired, { name: winner.name, n: event.streak })),
      );
    }
    if (event.type === 'milestone') {
      const milestone = ui.milestones[String(event.count)];
      if (milestone) {
        banner.push('', ansi.pink(`★ ${milestone.text}`));
        if (milestone.link) banner.push(ansi.dim('  [bouton LinkedIn sur le site]'));
      }
    }
  }
  return { state: quip.state, banner };
}

function nextTheme(state: GameState): GameState {
  const ids = catalog.themeIds;
  const next = ids[(ids.indexOf(state.theme) + 1) % ids.length] ?? MIXED_THEME;
  return changeTheme(state, next, ctx);
}

// ─── Mode automatique (sans clavier) ────────────────────────────────────────

if (args.auto !== undefined) {
  let state = createGame(ctx, args.theme);
  let banner: string[] = [];
  const count = Number(args.auto);
  for (let i = 0; i < count; i++) {
    // Le tenant gagne souvent, pour voir des séries et des retraites.
    const held = championSide(state);
    const side: Side = held && rng() < 0.8 ? held : rng() < 0.5 ? 'left' : 'right';
    ({ state, banner } = play(state, side));
  }
  render(state, banner);
  process.exit(0);
}

// ─── Mode interactif ────────────────────────────────────────────────────────

if (!process.stdin.isTTY) {
  console.error('Le mode interactif demande un vrai terminal. Essaie : npm run play -- --auto 30');
  process.exit(1);
}

let state = createGame(ctx, args.theme);
let banner: string[] = [];
render(state, banner);

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (_str: string | undefined, key: { name?: string; ctrl?: boolean }) => {
  if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
    console.log(`\n${ui.footer.disclaimer}\n`);
    process.exit(0);
  }
  if (key.name === 'left' || key.name === 'right') {
    ({ state, banner } = play(state, key.name));
  } else if (key.name === 's') {
    state = skipDuel(state, ctx);
    banner = [];
  } else if (key.name === 't') {
    state = nextTheme(state);
    banner = [];
  } else {
    return;
  }
  render(state, banner);
});
