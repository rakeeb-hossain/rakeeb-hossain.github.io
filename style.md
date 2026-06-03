# Style Guide — rakeebhossain.com

The design aesthetic for this site. The goal: a quiet, text-first
"engineering logbook" that reads like a systems researcher's notebook —
serif prose for thinking and writing, a monospace accent for the engineering
signal, soft-white paper, and one restrained signature color.

All design decisions live as **tokens** in [`src/styles/global.css`](src/styles/global.css)
(a Tailwind v4 `@theme` block). Change a token there and it propagates
site-wide.

---

## Design principles

1. **Text does the work.** No cards, gradients, shadows, or chrome. Whitespace
   and typography carry the page.
2. **Two voices.** A serif for reading (researcher) + a monospace for metadata,
   navigation, code, and the brand (engineer). Nothing else.
3. **One accent, used sparingly.** The deep-maroon accent appears on links and
   hover states only — never on large fills.
4. **Soft, not stark.** Soft-white paper and a gentle near-black ink instead
   of pure black-on-white.
5. **Systems signals are tasteful.** ISO dates and monospace labels — subtle
   nods, not a retro-terminal costume.

---

## Tokens

### Typefaces

| Token          | Value                                                        | Use |
| -------------- | ------------------------------------------------------------ | --- |
| `--font-serif` | `"Iowan Old Style", "Charter", "Palatino Linotype", Palatino, Georgia, serif` | Body / reading |
| `--font-mono`  | `ui-monospace, SFMono-Regular, Menlo, monospace`             | Brand, nav, dates, labels, code |
| `--font-sans`  | system sans stack                                            | Reserved (alt body direction) |
| `--font-body`  | → `--font-serif`                                             | The active reading face |

- All system fonts — **zero web-font downloads**.
- **To swap the entire site's reading face**, change the single `--font-body`
  reference (e.g. to `var(--font-sans)`).
- Tailwind exposes these as `font-serif`, `font-mono`, `font-sans` utilities.

### Color

| Token            | Value     | Tailwind utility | Use |
| ---------------- | --------- | ---------------- | --- |
| `--color-paper`  | `#fcfcfc` | `bg-paper`       | Page background (soft white) |
| `--color-ink`    | `#26282d` | `text-ink`       | Primary text (gentle near-black) |
| `--color-muted`  | `#727781` | `text-muted`     | Metadata, dates, nav, labels |
| `--color-rule`   | `#eeeeef` | `border-rule`    | Hairline dividers |
| `--color-code-bg`| `#f2f2f3` | `bg-code-bg`     | Inline code + code-block background |
| `--color-accent` | `#7f1d1d` | `text-accent`    | Links & hover (deep maroon) |

- **To change the accent**, edit `--color-accent` once (e.g. `#1d4ed8` for the
  classic-blue direction we kept as an alternate).

---

## Layout & rhythm

- **Measure:** the page shell is `max-w-180` (720px), centered, with `px-7`
  (28px) gutters. **Reading prose is kept to the ~65ch typographic measure**
  (do _not_ apply `max-w-none` to `Prose`) — long lines are the main thing that
  makes serif text feel hard to read.
- **Body text:** `1.0625rem` (17px) with `1.65` line-height. Set via
  `prose-p`/`prose-li` modifiers in `Prose.astro`.
- **Header:** brand left, nav right, baseline-aligned, generous space below
  (`pt-16 pb-12`). No rule under it.
- **Footer:** monospace, muted, small.
- Be generous with vertical whitespace; let sections breathe.

---

## Components & conventions

- **Brand:** the author's name (`Rakeeb Hossain`) in mono, linking home.
- **Navigation:** mono, `text-muted`, `12.5px`, hover → `text-ink`. Currently a
  single `Writing` link to `/articles`.
- **Home page:** the intro/about page (`src/pages/index.mdx`); there is no
  separate `/about` route.
- **Links (prose):** `text-accent`, underlined with `underline-offset-2`,
  hover fades to `opacity-70`.
- **Dates:**
  - _Lists_ (e.g. `/articles`): compact ISO `YYYY-MM-DD`, mono, muted, left of
    the title.
  - _Article header_: full human date (`Month D, YYYY`), mono, muted.
- **Inline code:** mono, `0.85em`, `bg-code-bg`, rounded, no surrounding
  backticks.
- **Code blocks:** `bg-code-bg`, `text-ink`, `rounded-lg`.
- **Text selection:** tinted with 18% of the accent.

---

## Where it lives

| Concern                         | File |
| ------------------------------- | --- |
| Tokens (fonts, color, base)     | `src/styles/global.css` |
| Shell: header, nav, footer      | `src/layouts/Layout.astro` |
| Prose / body typography         | `src/components/Prose.astro` |
| Article title + date            | `src/layouts/ArticleLayout.astro` |
| Article list rows               | `src/pages/articles/index.astro` |

---

## Quick recipes

- **Switch body to sans:** `--font-body: var(--font-sans);`
- **Switch accent to blue:** `--color-accent: #1d4ed8;`
- **Whiter paper:** `--color-paper: #ffffff;` (and bump `--color-rule`
  toward `#ececec`).
- **Use a token in markup:** `class="text-accent"`, `class="bg-code-bg"`,
  `class="font-mono text-muted"`, etc.
