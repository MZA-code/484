/**
 * Mode console : jouer aux débats « Team X ou Team Y ? » dans le terminal,
 * avec le vrai moteur et les vrais contenus.
 *
 *   npm run play                       partie interactive (← → ↓ S C Q ; ↓ = aucun des deux)
 *   npm run play -- --category bouffe  choisir la catégorie de départ
 *   npm run play -- --seed 42          partie reproductible
 *   npm run play -- --auto 30          30 votes automatiques, puis le résumé (sans clavier)
 *
 * Les pourcentages sont simulés (signalés comme tels) : le mode console n'appelle pas l'API.
 * Les textes du jeu viennent de `content/` ; seule l'aide clavier, propre à cet outil, est ici.
 */
import { readFileSync } from 'node:fs';
import { emitKeypressEvents } from 'node:readline';
import { parseArgs } from 'node:util';
import { parseUi, parseRivalries } from '../src/data/parse';
import type { Rivalry } from '../src/data/schema';
import {
  changeCategory,
  createDebate,
  createDebateCatalog,
  debateNumber,
  debateQuip,
  MIXED_CATEGORY,
  profile,
  recordOutcome,
  skip,
  vote,
  type DebateContext,
  type DebateState,
  type Choice,
  type Team,
} from '../src/engine/debate';
import { unlockedIds } from '../src/engine/achievements';
import { shareOutcome, type PairResult } from '../src/engine/quips';
import { defaultRng, randomInt, seededRng } from '../src/engine/random';
import { colorFor } from '../src/lib/color';
import { formatText, plural } from '../src/lib/format';

// ─── Contenus ───────────────────────────────────────────────────────────────

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8'));

const ui = parseUi(readJson('ui-texts.fr.json'));
const { universes, categories, rivalries } = parseRivalries(readJson('rivalries.json'));
const byId = new Map(rivalries.map((r) => [r.id, r]));
const categoryLabels = new Map([
  [MIXED_CATEGORY, ui.home.mixedTheme.label],
  ...universes.map((u) => [u.id, u.label] as const),
  ...categories.map((c) => [c.id, c.label] as const),
]);

const rivalry = (id: string): Rivalry => {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown rivalry: ${id}`);
  return found;
};

// ─── Options ────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    category: { type: 'string', default: MIXED_CATEGORY },
    seed: { type: 'string' },
    auto: { type: 'string' },
  },
});

const rng = args.seed !== undefined ? seededRng(Number(args.seed)) : defaultRng;
const ctx: DebateContext = {
  catalog: createDebateCatalog(
    categories.map((c) => c.id),
    rivalries,
    universes,
  ),
  rng,
};

if (!ctx.catalog.pools.has(args.category)) {
  console.error(
    `Catégorie inconnue : ${args.category}. Catégories : ${ctx.catalog.categoryIds.join(', ')}`,
  );
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

const question = (r: Rivalry) =>
  r.question ?? formatText(ui.debate.question, { a: r.a.name, b: r.b.name });

function renderTeam(r: Rivalry, team: Team): string[] {
  const t = r[team];
  return [
    `${team === 'a' ? '←' : '→'}  ${ansi.dim(t.origin)}`,
    `   ${ansi.card(colorFor(`${r.id}:${team}`), ansi.bold(`TEAM ${t.name.toUpperCase()}`))}`,
    `   ${ansi.italic(t.line)}`,
  ];
}

function renderPanels(state: DebateState): string[] {
  const p = profile(state);
  const lines = ['', ansi.bold(ui.debate.teams.title.toUpperCase())];
  if (state.history.length === 0) lines.push(ansi.dim(`  ${ui.debate.teams.empty}`));
  for (const v of state.history.slice(0, 5)) {
    const r = rivalry(v.rivalryId);
    const percent = v.percent === null ? '' : ansi.dim(` · ${v.percent} %`);
    const choice =
      v.team === 'none' || v.team === 'both'
        ? `${ui.debate[v.team].label}${ansi.dim(` (${formatText(ui.debate[v.team].between, { a: r.a.name, b: r.b.name })})`)}`
        : `${r[v.team].name}${ansi.dim(` (contre ${r[v.team === 'a' ? 'b' : 'a'].name})`)}`;
    lines.push(`  • ${choice}${percent}`);
  }
  lines.push('', ansi.bold(ui.debate.profile.title.toUpperCase()));
  lines.push(`  ${plural(ui.debate.profile.count, p.count)}`);
  lines.push(
    `  ${
      p.agreementRate === null
        ? ui.debate.profile.agreementUnknown
        : formatText(ui.debate.profile.agreement, { percent: p.agreementRate })
    }`,
  );
  lines.push(`  ${plural(ui.debate.profile.rebels, p.rebels)}`);
  return lines;
}

function render(state: DebateState, banner: string[]): void {
  const r = rivalry(state.current);
  const category =
    r.category !== state.category ? ` ${ansi.dim(`· ${categoryLabels.get(r.category)}`)}` : '';
  const out = [
    `${ansi.card('#FFD23F', ansi.bold('484'))} ${ansi.bold('LEQUEL TU PRÉFÈRES ?')}   ${ansi.dim(`[${categoryLabels.get(state.category)}]`)}`,
    '',
    `${ansi.bold(formatText(ui.debate.number, { n: debateNumber(state) }).toUpperCase())}  ${ansi.dim(ui.debate.subtitle)}`,
    '',
    `${ansi.bold(question(r))}${category}`,
    '',
    ...renderTeam(r, 'a'),
    '',
    `      ${ansi.pink(ansi.bold(ui.debate.vs))}`,
    '',
    ...renderTeam(r, 'b'),
    '',
    ...banner,
    ...renderPanels(state),
    '',
    ansi.dim(
      `← / → choisir · ↑ « ${ui.debate.both.button} » · ↓ « ${ui.debate.none.button} » · S « ${ui.debate.skip} » · C changer de catégorie · Q quitter`,
    ),
  ];
  console.clear();
  console.log(out.join('\n'));
}

// ─── Partie ─────────────────────────────────────────────────────────────────

/** Votes simulés (le mode console n'appelle pas l'API). Parfois moins de 5 votes, parfois en panne. */
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

function play(state: DebateState, team: Choice): { state: DebateState; banner: string[] } {
  const r = rivalry(state.current);
  const result = vote(state, team, ctx);
  const outcome = shareOutcome(simulatePair());
  const withOutcome = recordOutcome(result.state, r.id, outcome);
  const quip = debateQuip(withOutcome, ui.quips, outcome, rng);

  const choice =
    team === 'none' || team === 'both'
      ? ui.debate[team].choice
      : formatText(ui.debate.choice, { name: r[team].name });
  const banner = [
    outcome.kind === 'share'
      ? `${ansi.bold(choice)} · ${formatText(ui.debate.share, { percent: outcome.percent })} ${ansi.dim('(simulé)')}`
      : ansi.bold(choice),
  ];
  if (outcome.kind === 'share') banner.push(bar(outcome.percent, colorFor(`${r.id}:${team}`)));
  if (outcome.kind === 'first') banner.push(ui.debate.firstVote);
  banner.push(ansi.italic(quip.text));
  // Achievements débloqués par ce vote (nombre de débats, catégories, série, rebelle…).
  const before = unlockedIds(state, ui.achievements.list, ctx.catalog);
  const after = unlockedIds(withOutcome, ui.achievements.list, ctx.catalog);
  for (const achievement of ui.achievements.list) {
    if (!after.has(achievement.id) || before.has(achievement.id)) continue;
    banner.push('', ansi.pink(`★ ${ui.achievements.unlocked} · ${achievement.name}`));
    banner.push(ansi.pink(`  ${achievement.text}`));
    if (achievement.link) banner.push(ansi.dim('  [bouton LinkedIn sur le site]'));
  }
  return { state: quip.state, banner };
}

function nextCategory(state: DebateState): DebateState {
  const ids = ctx.catalog.categoryIds;
  const next = ids[(ids.indexOf(state.category) + 1) % ids.length] ?? MIXED_CATEGORY;
  return changeCategory(state, next, ctx);
}

// ─── Mode automatique (sans clavier) ────────────────────────────────────────

if (args.auto !== undefined) {
  let state = createDebate(ctx, args.category);
  let banner: string[] = [];
  for (let i = 0; i < Number(args.auto); i++) {
    ({ state, banner } = play(state, rng() < 0.5 ? 'a' : 'b'));
  }
  render(state, banner);
  process.exit(0);
}

// ─── Mode interactif ────────────────────────────────────────────────────────

if (!process.stdin.isTTY) {
  console.error('Le mode interactif demande un vrai terminal. Essaie : npm run play -- --auto 30');
  process.exit(1);
}

let state = createDebate(ctx, args.category);
let banner: string[] = [];
render(state, banner);

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (_str: string | undefined, key: { name?: string; ctrl?: boolean }) => {
  if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
    console.log(`\n${ui.footer.disclaimer}\n`);
    process.exit(0);
  }
  const keys: Record<string, Choice> = { left: 'a', right: 'b', up: 'both', down: 'none' };
  const choice = key.name ? keys[key.name] : undefined;
  if (choice) {
    ({ state, banner } = play(state, choice));
  } else if (key.name === 's') {
    state = skip(state, ctx);
    banner = [];
  } else if (key.name === 'c') {
    state = nextCategory(state);
    banner = [];
  } else {
    return;
  }
  render(state, banner);
});
