export interface CashFlow {
  amount: number
  date: Date
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

export function computeXirr(cashFlows: CashFlow[]): number {
  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime())
  const t0 = sorted[0].date.getTime()
  const times = sorted.map(cf => (cf.date.getTime() - t0) / MS_PER_YEAR)
  const amounts = sorted.map(cf => cf.amount)

  function npv(r: number): number {
    return amounts.reduce((sum, a, i) => sum + a / Math.pow(1 + r, times[i]), 0)
  }

  function dnpv(r: number): number {
    return amounts.reduce((sum, a, i) => {
      if (times[i] === 0) return sum
      return sum - (times[i] * a) / Math.pow(1 + r, times[i] + 1)
    }, 0)
  }

  // Newton-Raphson starting from multiple guesses
  for (const guess of [0.1, 0.0, 0.3, -0.05, 0.5]) {
    let r = guess
    for (let i = 0; i < 300; i++) {
      const f = npv(r)
      const df = dnpv(r)
      if (!isFinite(f) || !isFinite(df) || Math.abs(df) < 1e-14) break
      const rNew = r - f / df
      if (rNew <= -1 || !isFinite(rNew)) break
      if (Math.abs(rNew - r) < 1e-10) return rNew
      r = rNew
    }
  }

  // Bisection fallback: scan for a bracket
  let lo = -0.999
  let hi = 10.0
  const fLo = npv(lo)
  const fHi = npv(hi)

  if (Math.sign(fLo) === Math.sign(fHi)) {
    // Narrow scan to find bracket
    let found = false
    for (let x = -0.95; x < 10; x += 0.05) {
      if (Math.sign(npv(x)) !== Math.sign(npv(x + 0.05))) {
        lo = x
        hi = x + 0.05
        found = true
        break
      }
    }
    if (!found) throw new Error('XIRR: impossibile trovare una soluzione. Verifica i dati.')
  }

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (Math.sign(npv(mid)) === Math.sign(npv(lo))) lo = mid
    else hi = mid
    if (hi - lo < 1e-10) return (lo + hi) / 2
  }

  return (lo + hi) / 2
}
