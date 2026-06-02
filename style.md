# Append-Only — Style Guide

The design aesthetic for this site. The goal: a quiet, text-first
"engineering logbook" that reads like a systems researcher's notebook —
serif prose for thinking and writing, a monospace accent for the engineering
signal, warm paper, and one restrained signature color.

All design decisions live as **tokens** in [`src/styles/global.css`](src/styles/global.css)
(a Tailwind v4 `@theme` block). Change a token there and it propagates
site-wide.

---

## Design principles

1. **Text does the work.** No cards, gradients, shadows, or chrome. Whitespace
   and typography carry the page.
2. **Two voices.** A serif for reading (researcher) + a monospace for metadata,
   navigation, code, and the brand (engineer). Nothing else.
3. **One accent, used sparingly.** The clay/rust accent appears on links and
   hover states only — never on large fills.
4. **Warm, not stark.** Off-white paper and warm near-black ink instead of pure
   black-on-white.
5. **Systems signals are tasteful.** ISO dates, a blinking `_` cursor, monospace
   labels — subtle nods, not a retro-terminal costume.

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
| `--color-paper`  | `#faf9f7` | `bg-paper`       | Page background (warm off-white) |
| `--color-ink`    | `#1c1b19` | `text-ink`       | Primary text (warm near-black) |
| `--color-muted`  | `#6b6862` | `text-muted`     | Metadata, dates, nav, labels |
| `--color-rule`   | `#e6e3dd` | `border-rule`    | Hairline dividers |
| `--color-code-bg`| `#f1efea` | `bg-code-bg`     | Inline code + code-block background |
| `--color-accent` | `#b5482b` | `text-accent`    | Links & hover (clay/rust) |

- **To change the accent**, edit `--color-accent` once (e.g. `#1d4ed8` for the
  classic-blue direction we considered).

---

## Layout & rhythm

- **Measure:** content column is `max-w-180` (720px), centered, with `px-7`
  (28px) gutters. Reading prose stays narrower via the typography plugin.
- **Header:** brand left, nav right, baseline-aligned, generous space below
  (`pt-16 pb-12`). No rule under it.
- **Footer:** monospace, muted, small.
- Be generous with vertical whitespace; let sections breathe.

---

## Components & conventions

- **Brand:** `Append-Only` in mono with a blinking `_` cursor
  (`.cursor` keyframes in `Layout.astro`).
- **Navigation:** mono, `text-muted`, `12.5px`, hover → `text-ink`.
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
- **Cooler/whiter paper:** `--color-paper: #ffffff;` (and bump `--color-rule`
  toward `#ececec`).
- **Use a token in markup:** `class="text-accent"`, `class="bg-code-bg"`,
  `class="font-mono text-muted"`, etc.
