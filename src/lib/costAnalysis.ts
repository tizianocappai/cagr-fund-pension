// ── Types ─────────────────────────────────────────────────────────────────────

export interface CostBenchmark {
  ter: number
  label: string
  range: string
}

export interface FutureProjection {
  scenario: 'current' | 'optimized'
  totalFees: number
  finalCapital: number
  netReturn: number
}

export interface CostImpact {
  feesPaid: number
  lostCapital: number
  missedReturn: number
  totalImpact: number
}

// ── Benchmark Data ────────────────────────────────────────────────────────────

/**
 * Returns TER benchmark for Italian pension funds (fonte: COVIP 2024).
 *
 * - Fondi negoziali (Cometa, Fonte): più efficienti, TER 0.20-0.40%
 * - Fondi aperti: TER 1.00-1.50%
 * - PIP: TER 1.50-2.50%
 *
 * @param flow - Fund type identifier ('cometa' or 'fonte')
 * @returns Benchmark data with TER, label, and range
 */
export function getCostBenchmark(flow: 'cometa' | 'fonte'): CostBenchmark {
  const benchmarks = {
    cometa: {
      ter: 0.003, // 0.30%
      label: 'Fondi pensione negoziali',
      range: '0.20-0.40%',
    },
    fonte: {
      ter: 0.0035, // 0.35%
      label: 'Fondi pensione negoziali',
      range: '0.25-0.45%',
    },
  }

  return benchmarks[flow]
}

// ── TER Calculation ───────────────────────────────────────────────────────────

/**
 * Calculates average invested capital over the period.
 *
 * For each year, computes cumulative contributions up to that year,
 * then averages across all years.
 *
 * @param yearRows - Array of yearly contribution data
 * @returns Average capital invested
 */
export function calculateAverageCapital(
  yearRows: Array<{ aderente: number; azienda: number; tfr: number; altro: number; fees: number }>
): number {
  let cumulative = 0
  let sum = 0

  for (const row of yearRows) {
    const netContribution = row.aderente + row.azienda + row.tfr + row.altro + row.fees
    cumulative += netContribution
    sum += cumulative
  }

  return yearRows.length > 0 ? sum / yearRows.length : 0
}

/**
 * Calculates TER (Total Expense Ratio).
 *
 * TER = (Annual Average Fees / Average Capital)
 *
 * @param totalFees - Total fees paid over the period (as positive number)
 * @param avgCapital - Average invested capital
 * @param years - Number of years
 * @returns TER as decimal (e.g., 0.0042 = 0.42%)
 */
export function calculateTER(totalFees: number, avgCapital: number, years: number): number {
  if (avgCapital <= 0 || years <= 0) return 0
  const annualFees = totalFees / years
  return annualFees / avgCapital
}

// ── Historical Impact ─────────────────────────────────────────────────────────

/**
 * Calculates the total impact of fees including missed returns.
 *
 * For each year's fees, compounds them forward to present using the fund's
 * actual return rate (XIRR). This shows what those fees would be worth if
 * they had been invested instead.
 *
 * @param yearRows - Array of yearly data with fees
 * @param xirr - Fund's annual return rate (as decimal)
 * @param currentYear - Current calendar year for calculations
 * @returns Cost impact breakdown
 *
 * @example
 * // Fees of €100 paid 5 years ago with 4% return
 * // Would be worth: €100 × (1.04)^5 = €122
 * // Missed return: €22
 */
export function calculateLostCapital(
  yearRows: Array<{ year: number; fees: number }>,
  xirr: number,
  currentYear: number
): CostImpact {
  let lostCapital = 0
  const feesPaid = yearRows.reduce((sum, row) => sum + Math.abs(row.fees), 0)

  for (const row of yearRows) {
    const yearsSince = currentYear - row.year
    const feesAbs = Math.abs(row.fees)

    // Compound fees forward to present
    if (yearsSince > 0 && xirr > -0.5) {
      const futureValue = feesAbs * Math.pow(1 + xirr, yearsSince)
      lostCapital += futureValue
    } else {
      lostCapital += feesAbs
    }
  }

  const missedReturn = lostCapital - feesPaid

  return {
    feesPaid,
    lostCapital,
    missedReturn,
    totalImpact: lostCapital,
  }
}

// ── Future Projection ─────────────────────────────────────────────────────────

/**
 * Projects future costs and final capital over a given time horizon.
 *
 * Simulates compound growth with annual contributions and fees (as % of capital).
 * Each year: newCapital = (capital + contribution) × (1 + return - ter)
 *
 * @param currentCapital - Starting capital
 * @param annualContribution - Annual contribution amount
 * @param years - Number of years to project
 * @param ter - Total Expense Ratio as decimal (e.g., 0.0042)
 * @param expectedReturn - Expected annual return as decimal (e.g., 0.037)
 * @returns Projection with total fees and final capital
 */
export function projectFutureCosts(
  currentCapital: number,
  annualContribution: number,
  years: number,
  ter: number,
  expectedReturn: number
): FutureProjection {
  let capital = currentCapital
  let totalFees = 0

  for (let year = 0; year < years; year++) {
    // Add annual contribution
    capital += annualContribution

    // Calculate fees for this year (before growth)
    const yearlyFee = capital * ter
    totalFees += yearlyFee

    // Apply net growth (return minus fees)
    capital = capital * (1 + expectedReturn - ter)
  }

  const netReturn = capital - currentCapital - (annualContribution * years) - totalFees

  return {
    scenario: 'current',
    totalFees,
    finalCapital: capital,
    netReturn,
  }
}

/**
 * Compares current TER scenario with an optimized lower-cost scenario.
 *
 * @param currentCapital - Starting capital
 * @param annualContribution - Annual contribution
 * @param years - Projection period
 * @param currentTER - Current Total Expense Ratio
 * @param optimizedTER - Target optimized TER (typically benchmark - 0.10%)
 * @param expectedReturn - Expected annual return
 * @returns Array with both scenarios for comparison
 */
export function compareScenarios(
  currentCapital: number,
  annualContribution: number,
  years: number,
  currentTER: number,
  optimizedTER: number,
  expectedReturn: number
): [FutureProjection, FutureProjection] {
  const currentScenario = projectFutureCosts(
    currentCapital,
    annualContribution,
    years,
    currentTER,
    expectedReturn
  )

  const optimizedScenario = projectFutureCosts(
    currentCapital,
    annualContribution,
    years,
    optimizedTER,
    expectedReturn
  )

  return [
    { ...currentScenario, scenario: 'current' },
    { ...optimizedScenario, scenario: 'optimized' },
  ]
}

/**
 * Estimates average annual contribution from historical data.
 *
 * @param yearRows - Historical yearly contributions
 * @returns Average annual contribution
 */
export function estimateAnnualContribution(
  yearRows: Array<{ aderente: number; azienda: number; tfr: number; altro: number }>
): number {
  if (yearRows.length === 0) return 0

  const total = yearRows.reduce(
    (sum, row) => sum + row.aderente + row.azienda + row.tfr + row.altro,
    0
  )

  return total / yearRows.length
}
