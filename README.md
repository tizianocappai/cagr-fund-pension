# Gennaro — Il detective del tuo fondo pensione

A client-side React SPA for analysing Italian pension fund performance. The application calculates the real annual growth rate (XIRR) of a pension fund portfolio from transaction data exported by the fund portal, and provides a set of educational tools for retirement planning.

No data is ever transmitted to a server. All computation runs entirely in the browser.

## Features

- **XIRR calculator** — upload the transaction export (`.xls` or `.xlsx`) from the fund portal and enter the current portfolio value to obtain the compound annual growth rate, contribution breakdown, fee analysis, and forward projection
- **FP vs TFR comparison** — side-by-side net-of-tax comparison between leaving severance pay (TFR) in the employer's account versus redirecting it to a pension fund, including IRPEF 2026 brackets, TFR separate taxation, and pension fund preferential rate (15% → 9% over 35 years)
- **Years lost calculator** — quantifies the opportunity cost of delayed contributions
- **Target capital calculator** — reverse-engineers the required annual contribution to reach a specified retirement capital
- **Risk and return** — explains compartment allocation (bonds/equities), historical loss probability, and hosts the Monte Carlo simulation
- **Monte Carlo simulation** — 10,000 stochastic paths using lognormal returns (Box-Muller), user-configurable expected return and volatility, configurable target capital, P10/P50/P90 scenario table, and outcome histogram

Supported funds: **Fondo Cometa**, **Fondo Fonte**.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | react-router 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Charts | Recharts |
| Excel parsing | SheetJS (`xlsx`) for `.xlsx`; DOMParser for `.xls` |
| XIRR solver | Newton-Raphson with bisection fallback |
| Testing | Vitest 4 + @testing-library/react + jsdom |
| Analytics | Vercel Analytics (conditional on cookie consent) |
| Deployment | Vercel |

## Getting started

```bash
npm install
npm run dev       # development server at http://localhost:5173
```

## Available commands

```bash
npm run dev        # start Vite dev server
npm run build      # TypeScript type-check + production build
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm run test       # run unit tests (single pass)
npm run test:watch # run tests in watch mode
```

## Project structure

```
src/
  lib/
    xirr.ts              # XIRR solver
    parseXls.ts          # Cometa .xls parser (HTML table → rows)
    parseFonte.ts        # Fonte .xls/.xlsx parser (column mapping → rows)
    readExcel.ts         # Unified file reader (.xlsx via SheetJS, .xls via DOMParser)
    monteCarlo.ts        # Monte Carlo engine: randn(), runSimulation()
    fileStorage.ts       # IndexedDB persistence (per-page key)
    formatters.ts        # EUR formatters, tick formatter for charts
    parse.ts             # parseEur(), parseRate(), parseItalianNumber()
    utils.ts             # cn() helper (clsx + tailwind-merge)
  components/
    CagrCalculator.tsx   # Main XIRR calculator component
    ForecastChart.tsx    # Future projection chart + year-by-year table
    MonteCarlo.tsx       # Monte Carlo simulation UI
    ContributionsChart.tsx
    CookieBanner.tsx
    BmcWidget.tsx
    Nav.tsx
    Footer.tsx
    ui/                  # Design-system primitives (Button, Input, Card, ...)
  pages/                 # One file per route
  test/
    setup.ts             # Vitest + jest-dom setup
  main.tsx               # App root: router + consent state
  index.css              # Tailwind v4 theme tokens
```

## Number parsing

The application handles two decimal formats produced by Italian portals:

- Italian locale (`1.234,56`): strip `.`, replace `,` with `.`
- SheetJS raw mode (`1234.56`): plain `parseFloat`

Detection: if the string contains `,` it is treated as Italian format; otherwise as standard decimal.

## XIRR convention

Contributions are negated (cash outflow = negative), current portfolio value is the positive terminal cash flow. The solver finds `r` such that `sum(CF_i / (1 + r)^((d_i - d_0) / 365.25)) = 0`.

## Monte Carlo model

Each simulation path applies per-year returns drawn from a normal distribution via the Box-Muller transform:

```
v += annualContrib
v *= 1 + rendimento + volatilita * randn()
v = max(v, 0)   // capital floor
```

Default parameters: real return 3.5%, volatility 11% (sourced from COVIP annual report and Dimson-Marsh-Staunton Global Investment Returns Yearbook). Both parameters are user-editable. The success criterion is whether the final capital exceeds the user-specified target.

## Tax calculations (FP vs TFR)

**IRPEF 2026 brackets** applied to gross salary:

| Income range | Rate |
|---|---|
| 0 – 28,000 | 23% |
| 28,001 – 50,000 | 33% |
| > 50,000 | 43% |

**TFR separate taxation** (`tassazione separata`): IRPEF is applied to `TFR / years_of_service` as the notional annual equivalent income to determine the marginal rate, then that rate is applied to the full TFR amount.

**Pension fund preferential rate** (`tassazione agevolata`): `max(9%, 15% - max(0, years - 15) * 0.3%)`, reaching the minimum of 9% after 35 years of participation.

## Privacy and GDPR

- Cookie consent is stored in `localStorage` under the key `gennaro_cookie_consent`
- Vercel Analytics and the Buy Me a Coffee widget are injected only after explicit acceptance
- No user data or uploaded files leave the device at any point

## Notes on dependencies

- All installs require `--legacy-peer-deps` (configured in `.npmrc`)
- `react-is` must be installed explicitly as a peer dependency of Recharts
- `vite.config.ts` imports `defineConfig` from `vitest/config`, not from `vite`, to support the `test` configuration field
