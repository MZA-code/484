/**
 * Schémas Zod des fichiers de `content/`. Ils sont vérifiés au build :
 * une erreur dans un JSON fait échouer le build avec un message lisible.
 */
import { z } from 'zod';
import { ACHIEVEMENT_KINDS } from '../engine/achievements';
import { MIXED_CATEGORY as MIXED_THEME } from '../engine/debate';
import { ICON_NAMES } from '../lib/icons';
import { isTeamImage, isTenorUrl } from '../server/gif-links';
import { brokenLinks, inlineVariables } from '../lib/inline';

/** Nom d'une icône intégrée (voir src/lib/icons.ts). */
const icon = z.enum(ICON_NAMES, {
  message: `icône inconnue ; icônes disponibles : ${ICON_NAMES.join(', ')}`,
});

const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'doit être en minuscules, chiffres et tirets (ex. « heros-batman-superman »)',
  );

const text = z.string().trim().min(1, 'ne doit pas être vide');

export const ThemeSchema = z.object({
  id: slug.refine((id) => id !== MIXED_THEME, `« ${MIXED_THEME} » est réservé à « Tout mélangé »`),
  label: text,
  tagline: text,
  icon,
  /**
   * GIF d'ambiance, en dernier recours pour une team sans GIF fiable : recherche générique
   * en anglais (« difficult choice »), ou GIF choisis à la main.
   */
  giphyQuery: text,
  giphyIds: z.array(text).optional(),
  /**
   * Écran « Catégorie terminée » : une phrase drôle propre à la catégorie et son GIF (recherche
   * Giphy en anglais, ou GIF choisis à la main). Absent : texte et GIF génériques.
   */
  finish: z.object({ line: text, giphyQuery: text, giphyIds: z.array(text).optional() }).optional(),
});

// ─── Rivalités « Team X ou Team Y ? » ───────────────────────────────────────

/** Une team (un camp d'une rivalité). L'origine est libre : une chocolatine n'a pas d'année de sortie. */
export const TeamSchema = z.object({
  name: text.max(60, 'doit rester court (60 caractères maximum)'),
  origin: text.max(80, 'doit rester courte (80 caractères maximum)'),
  line: text.max(120, 'doit rester courte (120 caractères maximum)'),
  /** Remarque affichée quand on choisit cette team ; sinon une remarque générique (ui-texts). */
  quip: text.max(140, 'doit rester courte (140 caractères maximum)').optional(),
  giphyIds: z.array(text),
  giphyQuery: text,
  /**
   * Mots-clés qui valident un résultat de recherche Giphy (titre, slug ou auteur, sans accents
   * ni casse). Absents : le nom de la team et `giphyQuery` (voir src/server/gif-match.ts).
   */
  giphyKeywords: z.array(text).min(1, 'mettre au moins un mot-clé, ou retirer le champ').optional(),
  /**
   * GIF choisis à la main par un lien Tenor (`https://media.tenor.com/…`), quand Giphy n'a rien
   * de bon. Tirés au sort avec les `giphyIds` (voir src/server/gif-links.ts).
   */
  gifUrls: z
    .array(
      z
        .string()
        .refine(
          isTenorUrl,
          'lien Tenor attendu, de la forme https://media.tenor.com/…/nom.gif (clic droit sur le GIF, « Copier l’adresse de l’image »)',
        ),
    )
    .min(1, 'mettre au moins un lien, ou retirer le champ')
    .optional(),
  /**
   * Images rangées sur le site (`/images/teams/…webp`), importées par la page de curation quand
   * ni Giphy ni Tenor n'ont rien. Tirées au sort avec les autres GIF choisis à la main.
   */
  images: z
    .array(
      z
        .string()
        .refine(
          isTeamImage,
          'image attendue, de la forme /images/teams/nom-1a2b3c4d.webp (à importer avec npm run gif-audit)',
        ),
    )
    .min(1, 'mettre au moins une image, ou retirer le champ')
    .optional(),
});

export const RivalrySchema = z.object({
  id: slug,
  category: slug,
  /** Question sur mesure ; sinon « Team A ou team B ? ». */
  question: text.max(120, 'doit rester courte (120 caractères maximum)').optional(),
  a: TeamSchema,
  b: TeamSchema,
  /** Remarques sur mesure pour « Les deux » et « Aucun des deux » ; sinon les génériques. */
  bothQuip: text.max(140, 'doit rester courte (140 caractères maximum)').optional(),
  noneQuip: text.max(140, 'doit rester courte (140 caractères maximum)').optional(),
});

/** Rivalités minimum par catégorie pour éviter de revoir la même trop vite. */
export const MIN_RIVALRIES_PER_CATEGORY = 3;

const pairKey = (a: string, b: string) =>
  [a, b]
    .map((n) => n.trim().toLowerCase())
    .sort()
    .join(' | ');

/** Un univers regroupe plusieurs catégories (« Écrans », « Pop culture »…). */
export const UniverseSchema = z.object({
  id: slug.refine((id) => id !== MIXED_THEME, `« ${MIXED_THEME} » est réservé à « Tout mélangé »`),
  label: text,
  tagline: text,
  icon,
  categories: z.array(slug).min(1, 'un univers doit contenir au moins une catégorie'),
});

export const RivalriesFileSchema = z
  .object({
    version: z.literal(1),
    universes: z.array(UniverseSchema).min(1),
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

    // Chaque catégorie appartient à exactement un univers.
    const universeOf = new Map<string, string>();
    const universeIds = new Set<string>();
    file.universes.forEach((universe, i) => {
      if (universeIds.has(universe.id) || categoryIds.has(universe.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['universes', i, 'id'],
          message: `identifiant d’univers déjà utilisé : ${universe.id}`,
        });
      }
      universeIds.add(universe.id);
      universe.categories.forEach((category, j) => {
        if (!categoryIds.has(category)) {
          ctx.addIssue({
            code: 'custom',
            path: ['universes', i, 'categories', j],
            message: `catégorie inconnue dans l’univers « ${universe.id} » : ${category}`,
          });
        } else if (universeOf.has(category)) {
          ctx.addIssue({
            code: 'custom',
            path: ['universes', i, 'categories', j],
            message: `la catégorie « ${category} » est déjà dans l’univers « ${universeOf.get(category)} »`,
          });
        }
        universeOf.set(category, universe.id);
      });
    });
    file.categories.forEach((category, i) => {
      if (!universeOf.has(category.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['categories', i, 'id'],
          message: `la catégorie « ${category.id} » n’est dans aucun univers`,
        });
      }
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
export type Universe = z.infer<typeof UniverseSchema>;
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

/** Variables utilisables dans les pages d'information (voir src/lib/inline.ts). */
export const PROSE_VARIABLES = ['email', 'domain', 'rivalries', 'categories', 'universes'] as const;

/** Texte long : liens `[libellé](adresse)` internes ou https, et variables connues seulement. */
const proseText = text.superRefine((value, ctx) => {
  for (const broken of brokenLinks(value)) {
    ctx.addIssue({
      code: 'custom',
      message: `lien mal formé : ${broken} (attendu : [libellé](/page) ou [libellé](https://…))`,
    });
  }
  for (const name of inlineVariables(value)) {
    if (!(PROSE_VARIABLES as readonly string[]).includes(name)) {
      ctx.addIssue({
        code: 'custom',
        message: `variable inconnue : {${name}} ; variables possibles : ${PROSE_VARIABLES.join(', ')}`,
      });
    }
  }
});

/** Page d'information : sections faites de paragraphes (texte) et de listes (tableau de textes). */
const prosePage = z.object({
  title: text,
  description: proseText,
  updated: text,
  sections: z
    .array(
      z.object({
        title: text,
        blocks: z.array(z.union([proseText, z.array(proseText).min(1)])).min(1),
      }),
    )
    .min(1),
});

export const UiTextsSchema = z.object({
  site: z.object({
    title: text,
    description: text,
    logo: text,
    name: text,
    socialLabel: text,
    motion: z.object({ label: text, on: text, off: text }),
    skipToContent: text,
    toc: text,
    email: z.email('adresse email invalide'),
    domain: text,
  }),
  links: z.object({ github: optionalLink, linkedin: optionalLink }),
  home: z.object({
    title: z.tuple([text, text, text]),
    intro: text,
    footnote: text,
    mixedTheme: z.object({ label: text, tagline: text, icon }),
    themesLabel: text,
    play: text,
    playUniverse: text,
  }),
  debate: z.object({
    pageTitle: text,
    number: template('n'),
    subtitle: text,
    question: template('a', 'b'),
    categoriesLabel: text,
    universesLabel: text,
    wholeUniverse: text,
    team: text,
    vs: text,
    skip: text,
    /** « Aucun des deux » : 3e choix, compté comme un débat tranché. */
    none: z.object({
      button: text,
      choice: text,
      label: text,
      between: template('a', 'b'),
      split: template('percent'),
    }),
    /** « Les deux » : 4e choix, compté comme un débat tranché. */
    both: z.object({
      button: text,
      choice: text,
      label: text,
      between: template('a', 'b'),
      split: template('percent'),
    }),
    keysHint: text,
    pickHint: text,
    loading: text,
    noscript: text,
    choice: template('name'),
    share: template('percent'),
    firstVote: text,
    milestoneLink: text,
    teams: z.object({ title: text, empty: text, versus: template('name') }),
    profile: z.object({
      title: text,
      count: pluralForms,
      agreement: template('percent'),
      agreementUnknown: text,
      rebels: pluralForms,
    }),
    hallLink: text,
    shareButton: text,
    shareCopied: text,
    shareText: template('a', 'b'),
    shareDescription: template('a', 'b'),
    loadError: text,
    /** Catégorie terminée : tous ses débats tranchés ou passés (rien ne revient tout seul). */
    finished: z.object({
      title: text,
      body: template('category'),
      /** « Tout mélangé » terminé : tout le site est tranché. */
      allKicker: text,
      allTitle: text,
      allBody: text,
      /** Pastille « 50/50 débats bouclés ». */
      score: template('n'),
      scoreLabel: text,
      /** Dans le cadre du GIF, tant qu'il n'est pas là (ou s'il n'y en a pas). */
      gifWait: text,
      next: text,
      remaining: pluralForms,
      replay: text,
      replayAll: text,
      replayHint: text,
    }),
    /** Bouton « Mauvais GIF ? » sous chaque carte. */
    gifReport: z.object({
      button: text,
      /** Nom accessible : commence par le texte visible (WCAG 2.5.3). */
      label: template('name'),
      thanks: quipList,
      limited: text,
      error: text,
      /** Mode admin : le GIF est écarté et remplacé sous tes yeux. */
      admin: text,
    }),
  }),
  quips: z.object({ high: quipList, mid: quipList, low: quipList, neutral: quipList }),
  /** Achievements : objectifs à débloquer (voir src/engine/achievements.ts). */
  achievements: z.object({
    title: text,
    unlocked: text,
    count: template('done', 'total'),
    next: template('name', 'left'),
    allDone: text,
    locked: text,
    list: z
      .array(
        z.object({
          id: slug,
          kind: z.enum(ACHIEVEMENT_KINDS, {
            message: `type inconnu ; types possibles : ${ACHIEVEMENT_KINDS.join(', ')}`,
          }),
          goal: z.number().int().positive('l’objectif doit être un nombre positif'),
          icon,
          name: text.max(40, 'doit rester court (40 caractères maximum)'),
          description: text,
          /** Phrase du bandeau de déblocage. */
          text,
          /** Affiche le lien LinkedIn dans le bandeau. */
          link: z.boolean().optional(),
        }),
      )
      .min(1)
      .superRefine((list, ctx) => {
        const seen = new Set<string>();
        list.forEach((a, i) => {
          if (seen.has(a.id)) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'id'],
              message: `achievement en double : ${a.id}`,
            });
          }
          seen.add(a.id);
        });
      }),
  }),
  hallOfFame: z.object({
    pageTitle: text,
    title: text,
    intro: text,
    totalVotes: pluralForms,
    filterLabel: text,
    popularTitle: text,
    popularIntro: text,
    podium: z.tuple([text, text, text]),
    closeTitle: text,
    closeIntro: text,
    landslideTitle: text,
    landslideIntro: text,
    votes: pluralForms,
    /** Part « aucun des deux » d'un débat. */
    none: template('percent'),
    /** Part « les deux » d'un débat. */
    both: template('percent'),
    empty: text,
    emptySection: text,
    loading: text,
    error: text,
    play: text,
  }),
  notFound: z.object({ pageTitle: text, code: text, title: text, text, back: text }),
  footer: z.object({
    /** Nom (pour les lecteurs d'écran) du groupe de liens Hall of Fame / autres projets. */
    links: text,
    projects: text,
    hallOfFame: text,
    disclaimer: text,
    /** Numéro de version (celui de package.json). */
    version: template('version'),
    giphy: z.object({ label: text, url: z.url() }),
    /** Affiché seulement si des GIF viennent de Tenor. */
    tenor: z.object({ label: text, url: z.url() }),
    legal: z.object({
      label: text,
      debates: text,
      about: text,
      mentions: text,
      privacy: text,
      accessibility: text,
    }),
  }),
  pages: z.object({
    mentions: prosePage,
    privacy: prosePage,
    accessibility: prosePage,
    about: prosePage,
  }),
  projectsPage: z.object({ title: text, intro: text, back: text }),
  og: z.object({ cta: template('domain') }),
  breadcrumb: z.object({ label: text, home: text, debates: text }),
  llms: z.object({
    intro: text,
    pagesTitle: text,
    categoriesTitle: text,
    infoTitle: text,
    debatesCount: template('n'),
    fullLinkLabel: text,
    fullLinkAbout: template('rivalries'),
    fullTitle: text,
    fullIntro: text,
  }),
  debatesPage: z.object({
    title: text,
    description: template('rivalries'),
    intro: template('rivalries', 'categories'),
    mixed: text,
    count: pluralForms,
  }),
  categoryPage: z.object({
    title: template('category'),
    description: template('n', 'category', 'tagline'),
    play: text,
    listTitle: template('n'),
    others: template('universe'),
  }),
  debateAbout: z.object({
    related: template('category'),
    categoryLink: template('n', 'category'),
  }),
  projects: z.array(z.object({ kind: text, title: text, text, url: z.url(), cta: text })),
});

export type Theme = z.infer<typeof ThemeSchema>;
export type UiTexts = z.infer<typeof UiTextsSchema>;
