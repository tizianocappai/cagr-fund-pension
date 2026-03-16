# CLAUDE.md — cagr-fund-pension

## Project overview

A minimal React + TypeScript single-page app that calculates the **CAGR (Compound Annual Growth Rate)** of an Italian pension fund portfolio using the **XIRR** method. The user uploads an `.xls` file exported from an Italian pension portal (the file is actually HTML, not binary Excel), enters the current portfolio value, and receives a full breakdown of returns, contributions, fees, and future projections.

## Commands

```bash
npm run dev       # start dev server (Vite, port 5173)
npm run build     # tsc type-check + Vite production build
npm run lint      # ESLint
npm run preview   # preview production build locally
```

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | react-router 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `postcss.config.js`) |
| UI components | Hand-rolled shadcn-style components in `src/components/ui/` |
| Charts | Recharts (installed alongside chart.js, but recharts is what's actually used) |
| Utilities | clsx + tailwind-merge + class-variance-authority |

## Project structure

```
src/
  lib/
    utils.ts          # cn() helper (clsx + twMerge)
    parseXls.ts       # HTML-table parser for the .xls export
    xirr.ts           # XIRR solver (Newton-Raphson + bisection fallback)
  components/
    ui/
      button.tsx        # always black bg / white text, type="button" default
      card.tsx
      badge.tsx
      input.tsx
      separator.tsx
      file-uploader.tsx # drag & drop, keyboard accessible (Enter/Space)
    Nav.tsx             # top navigation bar
    CagrCalculator.tsx  # main calculator: input → parse → XIRR → results
    ContributionsChart.tsx  # recharts bar chart (contributions by year)
    ForecastChart.tsx       # recharts line chart (future projection)
  pages/
    Cometa.tsx          # only active page, at / and /cometa
  main.tsx              # BrowserRouter + Routes
  index.css             # Tailwind v4 @import + @theme design tokens
```

## Design system

**Black & white paper aesthetic** — no colors, only greyscale. Emojis are used as the sole visual accent throughout (stats, labels, status).

Key CSS custom properties defined in `src/index.css` via `@theme`:
- `--color-background: #fafaf9` — off-white page background
- `--color-foreground: #0a0a0a` — near-black text
- `--color-muted: #f5f5f4` — subtle surface
- `--color-border: #e5e5e5` — dividers and card borders
- `--radius: 0.25rem` — tight radius, feels like print

**Important:** use `bg-black` / `text-white` for explicit black/white — do **not** use `bg-[--color-primary]` style arbitrary Tailwind values for colors, as Tailwind v4 does not auto-wrap bare CSS variable names in `var()`.

## Key implementation details

### File parsing (`src/lib/parseXls.ts`)
The `.xls` export from the Italian pension portal is actually an **HTML file** containing a single `<table>`. Parse it with `DOMParser` as `text/html`. Each `<tr>` in `<tbody>` is one transaction. Column order:

| Index | Field |
|---|---|
| 0 | Tipo Operazione |
| 2 | Data Operazione (DD/MM/YYYY) |
| 6 | Importo Lordo Aderente |
| 7 | Importo Lordo Azienda |
| 8 | TFR |
| 9 | Altro |
| 10 | Quota Spese (negative = cost) |

Italian number format: `1.322,64` → strip `.`, replace `,` with `.` → `parseFloat`.

### XIRR (`src/lib/xirr.ts`)
Solves `Σ [ CF_i / (1+r)^((d_i - d_0) / 365.25) ] = 0` using:
1. Newton-Raphson with multiple starting guesses
2. Bisection fallback if Newton-Raphson doesn't converge

**Cash flow convention:**
- Each transaction's `net` (aderente + azienda + tfr + altro + quotaSpese) is **negated** — contributions going *into* the fund are negative from the investor's perspective
- The user-entered current portfolio value is the **positive** terminal cash flow

### Bonus XIRR
A second XIRR is computed excluding `Importo Lordo Azienda` from the cost basis. This answers: *"what is my personal return on the capital I actually spent?"* Employer contributions become free upside, yielding a significantly higher rate.

## Routing

Only one active page: **Cometa** (`/` and `/cometa`). Adding a new route means:
1. Create `src/pages/NewPage.tsx`
2. Add a `{ to, label, emoji }` entry to the `links` array in `src/components/Nav.tsx`
3. Add a `<Route>` in `src/main.tsx`

## Accessibility standards

- All interactive non-button elements use `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space)
- All `<label>` elements are linked to inputs via `htmlFor` + `id`
- Hint/description text uses `aria-describedby`
- Decorative emojis have `aria-hidden="true"`
- Focus rings: `focus-visible:ring-2 ring-black ring-offset-2` on all interactive elements
- Hidden file inputs use `tabIndex={-1}` and `aria-hidden="true"`

## Dependency notes

- `chart.js` + `react-chartjs-2` are installed but **not used** — recharts was chosen instead for simpler React integration
- `react-is` is a required peer dependency of recharts; must be installed explicitly
- All npm installs require `--legacy-peer-deps` due to Vite 8 peer conflicts with some packages
- Vite dep cache (`node_modules/.vite`) may need manual deletion after installing new packages that are transitive deps of already-cached bundles
