/**
 * Schémas Zod des fichiers de `content/`. Ils sont vérifiés au build :
 * une erreur dans un JSON fait échouer le build avec un message lisible.
 */
import { z } from 'zod';
import { MIXED_THEME } from '../engine/catalog';

const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'doit être en minuscules, chiffres et tirets (ex. « robots-hal-9000 »)',
  );

const text = z.string().trim().min(1, 'ne doit pas être vide');

export const ThemeSchema = z.object({
  id: slug.refine((id) => id !== MIXED_THEME, `« ${MIXED_THEME} » est réservé à « Tout mélangé »`),
  label: text,
  tagline: text,
});

export const ContenderSchema = z.object({
  id: slug,
  theme: slug,
  name: text,
  origin: z.string().regex(/^.+ · \d{4}$/, 'doit suivre le format « Œuvre · année »'),
  line: text.max(120, 'doit rester courte (120 caractères maximum)'),
  giphyIds: z.array(text),
  giphyQuery: text,
});

/** Nombre minimum de prétendants par thème pour qu'un duel soit possible. */
export const MIN_CONTENDERS_PER_THEME = 2;

export const ContendersFileSchema = z
  .object({
    version: z.literal(1),
    themes: z.array(ThemeSchema).min(1),
    contenders: z.array(ContenderSchema),
  })
  .superRefine((file, ctx) => {
    const themeIds = new Set<string>();
    file.themes.forEach((theme, i) => {
      if (themeIds.has(theme.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['themes', i, 'id'],
          message: `thème en double : ${theme.id}`,
        });
      }
      themeIds.add(theme.id);
    });

    const ids = new Set<string>();
    const perTheme = new Map<string, number>();
    file.contenders.forEach((contender, i) => {
      if (ids.has(contender.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['contenders', i, 'id'],
          message: `identifiant en double : ${contender.id}`,
        });
      }
      ids.add(contender.id);
      if (!themeIds.has(contender.theme)) {
        ctx.addIssue({
          code: 'custom',
          path: ['contenders', i, 'theme'],
          message: `thème inconnu : ${contender.theme}`,
        });
      } else if (!contender.id.startsWith(`${contender.theme}-`)) {
        ctx.addIssue({
          code: 'custom',
          path: ['contenders', i, 'id'],
          message: `l’identifiant doit commencer par « ${contender.theme}- »`,
        });
      }
      perTheme.set(contender.theme, (perTheme.get(contender.theme) ?? 0) + 1);
    });

    file.themes.forEach((theme, i) => {
      const count = perTheme.get(theme.id) ?? 0;
      if (count < MIN_CONTENDERS_PER_THEME) {
        ctx.addIssue({
          code: 'custom',
          path: ['themes', i],
          message: `le thème « ${theme.id} » a ${count} prétendant(s), il en faut au moins ${MIN_CONTENDERS_PER_THEME}`,
        });
      }
    });
  });

// ─── Rivalités « Team X ou Team Y ? » ───────────────────────────────────────

/** Une team (un camp d'une rivalité). L'origine est libre : une chocolatine n'a pas d'année de sortie. */
export const TeamSchema = z.object({
  name: text.max(60, 'doit rester court (60 caractères maximum)'),
  origin: text.max(80, 'doit rester courte (80 caractères maximum)'),
  line: text.max(120, 'doit rester courte (120 caractères maximum)'),
  giphyIds: z.array(text),
  giphyQuery: text,
});

export const RivalrySchema = z.object({
  id: slug,
  category: slug,
  /** Question sur mesure ; sinon « Team A ou team B ? ». */
  question: text.max(120, 'doit rester courte (120 caractères maximum)').optional(),
  a: TeamSchema,
  b: TeamSchema,
});

/** Rivalités minimum par catégorie pour éviter de revoir la même trop vite. */
export const MIN_RIVALRIES_PER_CATEGORY = 3;

const pairKey = (a: string, b: string) =>
  [a, b]
    .map((n) => n.trim().toLowerCase())
    .sort()
    .join(' | ');

export const RivalriesFileSchema = z
  .object({
    version: z.literal(1),
    categories: z.array(ThemeSchema).min(1),
    rivalries: z.array(RivalrySchema),
  })
  .superRefine((file, ctx) => {
    const categoryIds = new Set<string>();
    file.categories.forEach((category, i) => {
      if (categoryIds.has(category.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['categories', i, 'id'],
          message: `catégorie en double : ${category.id}`,
        });
      }
      categoryIds.add(category.id);
    });

    const ids = new Set<string>();
    const pairs = new Map<string, string>();
    const perCategory = new Map<string, number>();
    file.rivalries.forEach((rivalry, i) => {
      const at = (...path: (string | number)[]) => ['rivalries', i, ...path];
      if (ids.has(rivalry.id)) {
        ctx.addIssue({
          code: 'custom',
          path: at('id'),
          message: `identifiant en double : ${rivalry.id}`,
        });
      }
      ids.add(rivalry.id);
      if (!categoryIds.has(rivalry.category)) {
        ctx.addIssue({
          code: 'custom',
          path: at('category'),
          message: `catégorie inconnue : ${rivalry.category}`,
        });
      } else if (!rivalry.id.startsWith(`${rivalry.category}-`)) {
        ctx.addIssue({
          code: 'custom',
          path: at('id'),
          message: `l’identifiant doit commencer par « ${rivalry.category}- »`,
        });
      }
      const key = pairKey(rivalry.a.name, rivalry.b.name);
      if (rivalry.a.name.trim().toLowerCase() === rivalry.b.name.trim().toLowerCase()) {
        ctx.addIssue({
          code: 'custom',
          path: at('b', 'name'),
          message: 'les deux teams ont le même nom',
        });
      } else if (pairs.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: at('id'),
          message: `rivalité déjà présente : ${pairs.get(key)}`,
        });
      }
      pairs.set(key, rivalry.id);
      perCategory.set(rivalry.category, (perCategory.get(rivalry.category) ?? 0) + 1);
    });

    file.categories.forEach((category, i) => {
      const count = perCategory.get(category.id) ?? 0;
      if (count < MIN_RIVALRIES_PER_CATEGORY) {
        ctx.addIssue({
          code: 'custom',
          path: ['categories', i],
          message: `la catégorie « ${category.id} » a ${count} rivalité(s), il en faut au moins ${MIN_RIVALRIES_PER_CATEGORY}`,
        });
      }
    });
  });

export type Team = z.infer<typeof TeamSchema>;
export type Rivalry = z.infer<typeof RivalrySchema>;
export type RivalriesFile = z.infer<typeof RivalriesFileSchema>;

/** Un texte qui doit contenir certains marqueurs, par exemple `{name}`. */
const template = (...placeholders: string[]) =>
  placeholders.reduce(
    (schema, p) =>
      schema.refine((value) => value.includes(`{${p}}`), `doit contenir le marqueur {${p}}`),
    text,
  );

/** Une liste de remarques : au moins deux, pour ne jamais répéter deux fois de suite. */
const quipList = z.array(text).min(2, 'il faut au moins 2 remarques pour éviter les répétitions');

/** Lien externe facultatif : une URL vide masque le lien (ex. LinkedIn pas encore renseigné). */
const optionalLink = z.object({ label: text, url: z.union([z.url(), z.literal('')]) });

const pluralForms = z.object({ one: text, other: template('n') });

export const UiTextsSchema = z.object({
  site: z.object({
    title: text,
    description: text,
    logo: text,
    name: text,
    socialLabel: text,
    skipToContent: text,
  }),
  links: z.object({ github: optionalLink, linkedin: optionalLink }),
  home: z.object({
    title: z.tuple([text, text, text]),
    intro: text,
    footnote: text,
    mixedTheme: z.object({ label: text, tagline: text }),
    themesLabel: text,
    themeCount: template('n'),
    play: text,
  }),
  duel: z.object({
    pageTitle: text,
    number: template('n'),
    themesLabel: text,
    vs: text,
    choose: template('name'),
    keysHint: text,
    loading: text,
    noscript: text,
    milestoneLink: text,
    subtitle: text,
    skip: text,
    firstVote: text,
    choice: template('name'),
    share: template('percent'),
    retired: template('name', 'n'),
    streakBadge: pluralForms,
  }),
  debate: z.object({
    number: template('n'),
    question: template('a', 'b'),
    choice: template('name'),
    share: template('percent'),
    profile: z.object({
      title: text,
      count: pluralForms,
      agreement: template('percent'),
      agreementUnknown: text,
      rebels: pluralForms,
    }),
    teams: z.object({ title: text, empty: text }),
  }),
  quips: z.object({ high: quipList, mid: quipList, low: quipList, neutral: quipList }),
  milestones: z.record(
    z.string().regex(/^[1-9]\d*$/, 'la clé d’un palier doit être un nombre de duels'),
    z.object({ text, link: z.boolean().optional() }),
  ),
  panels: z.object({
    top: z.object({ title: text, empty: text, wins: pluralForms }),
    records: z.object({
      title: text,
      bestStreak: text,
      bestStreakValue: template('name', 'n'),
      none: text,
      retired: text,
      pool: text,
      hallLink: text,
    }),
  }),
  hallOfFame: z.object({
    pageTitle: text,
    title: text,
    intro: text,
    totalVotes: pluralForms,
    filterLabel: text,
    topTitle: text,
    podium: z.tuple([text, text, text]),
    flopTitle: text,
    flopIntro: text,
    closeTitle: text,
    closeIntro: text,
    winRate: template('percent'),
    record: template('wins', 'losses'),
    versus: text,
    empty: text,
    emptyClose: text,
    loading: text,
    error: text,
    play: text,
  }),
  notFound: z.object({ pageTitle: text, code: text, title: text, text, back: text }),
  footer: z.object({
    projects: text,
    hallOfFame: text,
    disclaimer: text,
    giphy: z.object({ label: text, url: z.url() }),
  }),
  projectsPage: z.object({ title: text, intro: text, back: text }),
  projects: z.array(z.object({ kind: text, title: text, text, url: z.url(), cta: text })),
});

export type Theme = z.infer<typeof ThemeSchema>;
export type Contender = z.infer<typeof ContenderSchema>;
export type ContendersFile = z.infer<typeof ContendersFileSchema>;
export type UiTexts = z.infer<typeof UiTextsSchema>;
