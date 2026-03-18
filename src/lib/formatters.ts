/** Currency formatter with 2 decimal places — e.g. "€ 1.234,56" */
export const fmtEur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

/** Currency formatter rounded to whole euros — e.g. "€ 1.235" */
export const fmtEurRound = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const _fmtTick    = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 })
const _fmtTickDec = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Chart Y-axis tick formatter: €1,5M / €250k / €740 */
export function tickY(v: number): string {
  if (v >= 1_000_000) return `€${_fmtTickDec.format(v / 1_000_000)}M`
  if (v >= 1_000)     return `€${_fmtTick.format(v / 1_000)}k`
  return `€${_fmtTick.format(v)}`
}
