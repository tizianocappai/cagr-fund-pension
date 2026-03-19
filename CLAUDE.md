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
      button.tsx         # GOV.UK green primary button, variant prop
      card.tsx           # Sharp-cornered card with border
      input.tsx          # 2px border, yellow focus ring
      separator.tsx
      file-uploader.tsx  # Drag & drop, keyboard accessible
      tooltip.tsx        # Hover/focus tooltip with black border
    Nav.tsx              # Black service banner + tab navigation
    Footer.tsx           # GOV.UK-style footer with beta disclaimer
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

## Design system — GOV.UK inspired

Visual style inspired by [GOV.UK Design System](https://design-system.service.gov.uk/).

Key CSS custom properties defined in `src/index.css` via `@theme`:

| Token                      | Value     | Usage                            |
| -------------------------- | --------- | -------------------------------- |
| `--color-background`       | `#ffffff` | Page background                  |
| `--color-foreground`       | `#0b0c0c` | Primary text                     |
| `--color-muted`            | `#f3f2f1` | Subtle surfaces                  |
| `--color-muted-foreground` | `#505a5f` | Secondary text                   |
| `--color-border`           | `#b1b4b6` | Card/separator borders           |
| `--color-primary`          | `#00703c` | Primary button background        |
| `--color-focus`            | `#ffdd00` | Focus ring (yellow)              |
| `--color-error`            | `#d4351c` | Error states                     |
| `--radius`                 | `0rem`    | No border radius (sharp corners) |

**Key rules:**

- Use Tailwind canonical classes (`text-muted-foreground`, `border-border`, `bg-muted`) — do NOT use `bg-[--color-*]` arbitrary values
- `bg-black` / `text-white` only for the service name header bar
- Inputs: `border-2 border-[#0b0c0c]`, yellow `focus-visible:outline-[#ffdd00]`
- Buttons: green `bg-[#00703c]`, `shadow-[0_2px_0_#002d18]`, no border-radius
- Section headings in results: `border-l-4 border-[#0b0c0c] pl-3 font-bold`
- Errors: `border-l-4 border-error bg-[#fde8e6]`
- Info callouts: `border-l-4 border-[#1d70b8] bg-[#e8f1f8]`
- Links: `#1d70b8`, underlined; hover `#003078` with thicker underline
- Focus: yellow `#ffdd00` outline, 3px, offset 0

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
- Focus rings: `focus-visible:outline-3 focus-visible:outline-[#ffdd00]` on all interactive elements
- Hidden file inputs: `tabIndex={-1}` + `aria-hidden="true"`

## Dependency notes

- All npm installs require `--legacy-peer-deps` (`.npmrc` sets this)
- `react-is` must be installed explicitly (peer dep of recharts)
- Vite dep cache (`node_modules/.vite`) may need manual deletion after installing packages that are already cached transitive deps
- `@vercel/analytics/react` — use `/react` not `/next` for Vite apps
