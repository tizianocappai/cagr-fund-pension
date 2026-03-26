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
      button.tsx         # shadcn Button - blue primary, rounded corners
      card.tsx           # shadcn Card - subtle shadows, rounded corners
      input.tsx          # shadcn Input - blue focus ring, rounded borders
      separator.tsx      # shadcn Separator
      badge.tsx          # shadcn Badge
      label.tsx          # shadcn Label
      select.tsx         # shadcn Select dropdown
      dialog.tsx         # shadcn Dialog modal
      alert.tsx          # shadcn Alert for info/error callouts
      table.tsx          # shadcn Table components
      tooltip.tsx        # shadcn Tooltip (Radix UI based)
      file-uploader.tsx  # Custom drag & drop uploader with semantic tokens
      chart-tooltip.tsx  # Custom Recharts tooltip with semantic tokens
    Nav.tsx              # White header with blue active tabs
    Footer.tsx           # Footer with muted background
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

## Design system — Modern shadcn/ui

Visual style based on [shadcn/ui](https://ui.shadcn.com/) with a clean, professional aesthetic featuring blue accents, rounded corners, and subtle shadows.

### Design tokens

Key CSS custom properties defined in `src/index.css` via `@theme` (HSL format):

| Token                          | HSL Value               | Hex Equivalent | Usage                            |
| ------------------------------ | ----------------------- | -------------- | -------------------------------- |
| `--color-background`           | `0 0% 100%`             | `#ffffff`      | Page background                  |
| `--color-foreground`           | `0 0% 3.9%`             | `#0a0a0a`      | Primary text                     |
| `--color-card`                 | `0 0% 100%`             | `#ffffff`      | Card backgrounds                 |
| `--color-card-foreground`      | `0 0% 3.9%`             | `#0a0a0a`      | Card text                        |
| `--color-muted`                | `0 0% 96.1%`            | `#f5f5f5`      | Subtle surfaces                  |
| `--color-muted-foreground`     | `0 0% 45.1%`            | `#737373`      | Secondary text                   |
| `--color-border`               | `0 0% 89.8%`            | `#e5e5e5`      | Card/separator borders           |
| `--color-primary`              | `221.2 83.2% 53.3%`     | `#3b82f6`      | Primary button (blue)            |
| `--color-primary-foreground`   | `0 0% 100%`             | `#ffffff`      | Text on primary buttons          |
| `--color-destructive`          | `0 84.2% 60.2%`         | `#ef4444`      | Error states                     |
| `--color-destructive-foreground` | `0 0% 98%`            | `#fafafa`      | Text on error backgrounds        |
| `--color-ring`                 | `221.2 83.2% 53.3%`     | `#3b82f6`      | Focus ring (blue)                |
| `--radius`                     | `0.5rem`                | `8px`          | Border radius for components     |

### Component library

The project uses **shadcn/ui** components built on **Radix UI** primitives. All components follow the shadcn/ui design patterns:

- **Button**: Blue primary variant, secondary (muted), destructive (red), ghost, and outline variants
- **Card**: Rounded corners (8px), subtle border, optional shadow
- **Input**: Rounded borders, blue focus ring, proper focus states
- **Alert**: Info (default blue accent) and destructive (red) variants for callouts
- **Dialog**: Modal overlay with backdrop, rounded content
- **Select**: Dropdown with rounded styling, proper keyboard navigation
- **Tooltip**: Radix UI based with TooltipProvider, TooltipTrigger, TooltipContent structure
- **Table**: Clean table styling with striped rows and header styling

### Key styling rules

**Use semantic Tailwind classes** — always prefer canonical utility classes over arbitrary values:
- ✅ `bg-muted`, `text-muted-foreground`, `border-border`, `text-foreground`
- ❌ `bg-[#f5f5f5]`, `text-[#737373]`, `border-[#e5e5e5]`

**Component patterns:**
- **Section headings**: `<h2 className="text-lg font-semibold mb-4">Title</h2>`
- **Info callouts**: `<Alert><AlertDescription>Content</AlertDescription></Alert>`
- **Error callouts**: `<Alert variant="destructive"><AlertDescription>Content</AlertDescription></Alert>`
- **Focus states**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Rounded corners**: Most interactive elements use `rounded-md` (0.375rem) or inherit `--radius`

**Links:**
- Color: `hsl(var(--color-primary))` (blue)
- Underlined by default with 4px offset
- Hover: thicker underline (2px)
- Focus: 2px blue ring with 2px offset, slightly rounded

**Important:**
- Tailwind v4 does NOT auto-wrap bare CSS variable names in `var()`. Always use explicit HSL values with `hsl(var(--color-*))` or canonical utility classes.
- Charts (Recharts components) can use any colors for data visualization — the color restrictions apply only to UI chrome.
- shadcn Tooltip components require proper structure: `<TooltipProvider><Tooltip><TooltipTrigger><TooltipContent></TooltipProvider>`

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
