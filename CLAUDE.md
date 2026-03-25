# CLAUDE.md — Gennaro · Il detective del tuo fondo pensione

## Project overview

**Gennaro** is a React + TypeScript SPA that calculates the real annual growth rate of an Italian pension fund portfolio using the **XIRR** method. The user uploads an `.xls` or `.xlsx` file exported from an Italian pension portal, enters the current portfolio value, and receives a full breakdown of returns, contributions, fees, and future projections.

Supported funds: **Cometa** and **Fonte** (`/rendimento-fondo`).

## Commands

```bash
npm run dev        # start dev server (Vite, port 5173)
npm run build      # tsc type-check + Vite production build
npm run lint       # ESLint
npm run preview    # preview production build locally
npm run test       # run unit tests (Vitest, single pass)
npm run test:watch # run tests in watch mode
```

## Stack

| Layer         | Choice                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| Framework     | React 19 + TypeScript                                                     |
| Build         | Vite 8                                                                    |
| Routing       | react-router 7                                                            |
| Styling       | Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `postcss.config.js`) |
| UI components | Hand-rolled components in `src/components/ui/`                            |
| Charts        | Recharts                                                                  |
| Utilities     | clsx + tailwind-merge + class-variance-authority                          |
| Analytics     | `@vercel/analytics/react` (NOT `/next`)                                   |
| Excel parsing | SheetJS (`xlsx`) for `.xlsx`; DOMParser for `.xls` (HTML tables)          |
| Testing       | Vitest 4 + @testing-library/react + jsdom                                 |

## Project structure

```
src/
  lib/
    utils.ts             # cn() helper (clsx + twMerge)
    parseXls.ts          # HTML-table parser for Cometa .xls export → string[][]
    parseFonte.ts        # Column parser for Fonte .xls/.xlsx → string[][]
    readExcel.ts         # Unified file reader: .xlsx via SheetJS, .xls via DOMParser
    xirr.ts              # XIRR solver (Newton-Raphson + bisection fallback)
    fileStorage.ts       # IndexedDB save/load/clear with per-page key
    monteCarlo.ts        # Monte Carlo simulation engine (randn, runSimulation)
    monteCarlo.test.ts   # Unit tests for simulation pure functions
  components/
    ui/
      button.tsx         # M3 button variants (filled, tonal, outlined, text, elevated)
      card.tsx           # M3 card with elevation variants
      input.tsx          # M3 text field with state layers
      separator.tsx      # M3 divider
      file-uploader.tsx  # Drag & drop, keyboard accessible
      tooltip.tsx        # M3 plain tooltip with elevation
      callout.tsx        # M3 info/warning/error callout boxes
    Nav.tsx              # M3 navigation bar with primary brand bar
    Footer.tsx           # Simple footer with beta disclaimer
    CookieBanner.tsx     # GDPR cookie consent banner (localStorage)
    CagrCalculator.tsx   # Main calculator: file → parse → XIRR → results
    ContributionsChart.tsx   # Recharts bar chart (contributions by year)
    ForecastChart.tsx        # Recharts line chart (future projection, starts from 0)
    MonteCarlo.tsx           # Monte Carlo simulation UI
    MonteCarlo.test.tsx      # Component tests for MonteCarlo
  pages/
    Missione.tsx             # / — mission / educational content
    RendimentoFondo.tsx      # /rendimento-fondo — Cometa + Fonte calculator flows
    CometaGuide.tsx          # /cometa-guide — step-by-step export guide
    FpVsTfr.tsx              # /fp-vs-tfr — pension fund vs TFR comparison + tax
    AnniPersi.tsx            # /anni-persi — cost of delaying contributions
    CalcoloObiettivo.tsx     # /obiettivo — target capital calculator
    RischioRendimento.tsx    # /rischio-rendimento — risk/return + Monte Carlo
    PrivacyPolicy.tsx        # /privacy — GDPR privacy policy
  test/
    setup.ts                 # Vitest setup: @testing-library/jest-dom matchers
  main.tsx                   # App component: BrowserRouter + Routes + consent state
  index.css                  # Tailwind v4 @import + @theme design tokens
```

## Design system — Material Design 3

Visual style follows [Material Design 3](https://m3.material.io/) (Material You) guidelines.

### Color System

Key CSS custom properties defined in `src/index.css` via `@theme`:

**Primary colors:**
- `--color-primary` = `#6750A4` (viola M3)
- `--color-on-primary` = `#FFFFFF`
- `--color-primary-container` = `#EADDFF`
- `--color-on-primary-container` = `#21005D`

**Secondary colors:**
- `--color-secondary` = `#625B71`
- `--color-on-secondary` = `#FFFFFF`
- `--color-secondary-container` = `#E8DEF8`
- `--color-on-secondary-container` = `#1D192B`

**Semantic colors:**
- `--color-error` = `#B3261E`
- `--color-success` = `#198754`
- `--color-warning` = `#FFA726`

**Surface & background:**
- `--color-surface` = `#FFFBFE` (warm white)
- `--color-surface-container` = `#F3EDF7`
- `--color-surface-container-high` = `#ECE6F0`
- `--color-background` = `#FFFBFE`
- `--color-on-surface` = `#1C1B1F`
- `--color-on-surface-variant` = `#49454F`

**Outline & borders:**
- `--color-outline` = `#79747E`
- `--color-outline-variant` = `#CAC4D0`

### Elevation System

5 elevation levels using layered shadows:
- `--elevation-0` = none
- `--elevation-1` = `0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)`
- `--elevation-2` = `0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)`
- `--elevation-3` = `0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)`
- `--elevation-4` = `0px 6px 10px 4px rgba(0,0,0,0.15), 0px 2px 3px 0px rgba(0,0,0,0.3)`
- `--elevation-5` = `0px 8px 12px 6px rgba(0,0,0,0.15), 0px 4px 4px 0px rgba(0,0,0,0.3)`

Apply via `shadow-[var(--elevation-N)]` or utility classes `elevation-1` through `elevation-5`.

### Shape System

Border radius values:
- `--radius-xs` = 4px (small components)
- `--radius-sm` = 8px (buttons, chips)
- `--radius-md` = 12px (cards - default)
- `--radius-lg` = 16px (dialogs)
- `--radius-xl` = 28px (FABs, large cards)
- `--radius-full` = 9999px (pills only)

Apply via `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`.

### Typography Scale

Material 3 typography classes with precise pixel values:

| Class | Size / Line / Tracking | Usage |
|-------|----------------------|-------|
| `text-display-large` | 57px / 64px / -0.25px | Hero headlines |
| `text-display-medium` | 45px / 52px / 0px | Large headlines |
| `text-display-small` | 36px / 44px / 0px | Page titles |
| `text-headline-large` | 32px / 40px / 0px | Section headers |
| `text-headline-medium` | 28px / 36px / 0px | Card headers |
| `text-headline-small` | 24px / 32px / 0px | Subsections |
| `text-title-large` | 22px / 28px / 0px | List items |
| `text-title-medium` | 16px / 24px / 0.15px | Subheaders |
| `text-title-small` | 14px / 20px / 0.1px | Small labels |
| `text-body-large` | 16px / 24px / 0.5px | Body text |
| `text-body-medium` | 14px / 20px / 0.25px | Default text |
| `text-body-small` | 12px / 16px / 0.4px | Captions |
| `text-label-large` | 14px / 20px / 0.1px | Button text |
| `text-label-medium` | 12px / 16px / 0.5px | Small buttons |
| `text-label-small` | 11px / 16px / 0.5px | Tiny labels |

Use inline pixel values only when M3 scale doesn't match exactly: `text-[22px] leading-[28px] tracking-[0px]`.

### State Layers

Interactive elements use opacity overlays for hover/focus/pressed states:

- Hover: `opacity-08` (8% overlay of on-surface color)
- Focus: `opacity-12` (12% overlay)
- Pressed: `opacity-12` (12% overlay)
- Disabled: `opacity-38` (38% of original)

Apply via `hover:bg-primary/8`, `focus:bg-primary/12`, `active:bg-primary/12`.

### Component Patterns

**Buttons:**
- 5 variants: filled (default), tonal, outlined, text, elevated
- Use `rounded-full` (pill shape) for M3 buttons
- Add elevation transitions on hover: `hover:shadow-[var(--elevation-1)]`
- Text color follows on-color tokens: `text-on-primary`, `text-on-secondary-container`

**Cards:**
- 3 variants: elevated (default, with `elevation-1`), filled (`bg-surface-container-highest`), outlined (`border border-outline`)
- Use `rounded-xl` (16px) for cards
- Clickable cards add `hover:elevation-2` transition

**Text fields (Input):**
- Outlined variant (default): `border border-outline rounded-sm`
- Focus state: `focus:border-primary focus:ring-1 focus:ring-primary`
- No `border-2` — M3 uses 1px borders
- Helper text below with `text-body-small text-on-surface-variant`

**Callouts:**
- Use Callout component with variants: info, success, warning, error
- Surface container background with semantic border-left accent
- No `border-l-4` — use `border-l` with semantic color

**Charts:**
- Colors from `src/lib/chartColors.ts` — NEVER hardcode hex values
- Grid lines: `chartColors.grid` (`#E7E0EC`)
- Axis text: `chartColors.axis` (`#49454F`)
- Data series: use `chartColors.primary`, `chartColors.success`, `chartColors.warning`, etc.

**Navigation:**
- Primary brand bar: `bg-primary text-on-primary`
- Nav links: `text-on-surface-variant`, active `text-primary border-b-2 border-primary`
- Mobile drawer: `bg-surface-container elevation-2`

**Key Rules:**

✅ **DO:**
- Use M3 canonical Tailwind classes: `text-on-surface`, `bg-primary`, `border-outline`
- Use elevation system: `shadow-[var(--elevation-N)]` or `elevation-N` utility classes
- Use M3 typography scale: `text-headline-medium`, `text-body-large`, etc.
- Import colors from `chartColors.ts` for all visualizations
- Use 1px borders: `border` (not `border-2`)
- Apply state layers: `hover:bg-primary/8`, `active:bg-primary/12`

❌ **DON'T:**
- Hardcode hex colors: ~~`#6750A4`~~, ~~`#B3261E`~~, ~~`#00703c`~~, ~~`#d4351c`~~
- Use `border-2` (GOV.UK pattern) — use `border` (1px)
- Use `border-l-4` for callouts — use `border-l` with elevation
- Use `rounded-0` or sharp corners — M3 uses rounded shapes
- Mix inline `style={{ color: '#...' }}` — use color tokens
- Use arbitrary values `bg-[--color-*]` — use canonical classes

**Important:** Tailwind v4 does NOT auto-wrap bare CSS variable names in `var()`. Always use explicit values or canonical utility classes.

## Key implementation details

### File reading (`src/lib/readExcel.ts`)

Unified entry point for both file types:

- `.xlsx` → SheetJS `XLSX.read(arrayBuffer, {type:'array'})` + `sheet_to_json({header:1, raw:true})`. Numbers come as JS numbers; convert with `.toString()` to avoid locale formatting issues.
- `.xls` → DOMParser as `text/html`; Italian portals export HTML tables disguised as XLS.

### Number parsing

Both parsers use locale-aware `parseItalianNumber(s)`:

- If string contains `,` → Italian format (`1.234,56`): strip `.`, replace `,` with `.`
- Otherwise → standard decimal (`55.53` from SheetJS raw mode): plain `parseFloat`

### Column mapping

**Cometa** (`parseXls.ts`) — HTML table columns:
| Index | Field |
|---|---|
| 0 | Tipo Operazione |
| 2 | Data Operazione (DD/MM/YYYY) |
| 6 | Importo Lordo Aderente |
| 7 | Importo Lordo Azienda |
| 8 | TFR |
| 9 | Altro |
| 10 | Quota Spese (negative = cost) |

**Fonte** (`parseFonte.ts`) — XLS/XLSX columns:
| Index | Field |
|---|---|
| 0 | Quadrimestre (1–4) |
| 1 | Anno |
| 2 | Skip |
| 3 | Ragione Sociale |
| 4 | Importo Lordo Aderente |
| 5 | Importo Lordo Azienda |
| 6 | TFR |
| 7–11 | Premi aggiuntivi → summed into `altro` |

Date for Fonte is derived from quarter: Q1→Mar31, Q2→Jun30, Q3→Sep30, Q4→Dec31.

### XIRR (`src/lib/xirr.ts`)

Solves `Σ [ CF_i / (1+r)^((d_i - d_0) / 365.25) ] = 0` using Newton-Raphson + bisection fallback.

Cash flow convention: contributions are **negated** (money into fund = negative); current portfolio value = positive terminal cash flow.

### Forecast chart (`src/components/ForecastChart.tsx`)

- Starts from **zero** (not from current portfolio value)
- Individual lines (aderente, azienda, TFR): **linear** — `cX × year` (raw accumulation, no interest)
- **Totale** line: compound interest — `v = (v + cAderente + cAzienda + cTfr) × (1 + r)` each year
- `flow` prop (`'cometa' | 'fonte'`) is passed for clarity and future differentiation

### `flow` prop

Both `CagrCalculator` and `ForecastChart` accept `flow: 'cometa' | 'fonte'`. Pages pass it explicitly to prevent mapping mistakes. `ResultsPanel` inside `CagrCalculator` also receives it to thread it down.

## Routing

| Path                  | Page                                   |
| --------------------- | -------------------------------------- |
| `/`                   | Missione                               |
| `/rendimento-fondo`   | RendimentoFondo (Cometa + Fonte flows) |
| `/cometa-guide`       | CometaGuide                            |
| `/fp-vs-tfr`          | FpVsTfr                                |
| `/anni-persi`         | AnniPersi                              |
| `/obiettivo`          | CalcoloObiettivo                       |
| `/rischio-rendimento` | RischioRendimento                      |
| `/privacy`            | PrivacyPolicy                          |

Adding a new route: create `src/pages/NewPage.tsx`, add to `links` array in `Nav.tsx`, add `<Route>` in `main.tsx`.

## Testing

Framework: **Vitest 4** + **@testing-library/react** + **jsdom**.

Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom` matchers).

`vite.config.ts` imports from `vitest/config` (not `vite`) to expose the `test` field.

### Test locations

| File                                 | What it covers                                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `src/lib/monteCarlo.test.ts`         | `randn()` distribution, `runSimulation()` structure, deterministic zero-volatility, edge cases, statistical properties |
| `src/components/MonteCarlo.test.tsx` | Render, input state, button enable/disable, results after simulation                                                   |

### Key conventions

- Recharts is mocked in component tests (SVG not available in jsdom).
- `runSimulation` is imported from `src/lib/monteCarlo.ts` and tested in isolation from the component.
- Statistical assertions use large-sample comparisons (e.g. `p50_high > p50_low`) rather than exact values, since the engine uses `Math.random()`.
- `Math.random` can be mocked with `vi.spyOn` for deterministic edge-case tests; always call `vi.restoreAllMocks()` after.

## Accessibility standards

- Interactive non-button elements: `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space)
- Labels linked via `htmlFor` + `id`
- Hint text via `aria-describedby`
- Decorative emojis: `aria-hidden="true"`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` on all interactive elements
- Hidden file inputs: `tabIndex={-1}` + `aria-hidden="true"`

## Dependency notes

- All npm installs require `--legacy-peer-deps` (`.npmrc` sets this)
- `react-is` must be installed explicitly (peer dep of recharts)
- Vite dep cache (`node_modules/.vite`) may need manual deletion after installing packages that are already cached transitive deps
- `@vercel/analytics/react` — use `/react` not `/next` for Vite apps
