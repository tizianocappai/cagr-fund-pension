import { tickY } from '@/lib/formatters'

export const N_SIMULAZIONI = 10_000
const N_BUCKETS = 30

export interface SimResult {
  p10: number
  p50: number
  p90: number
  successRate: number
  target: number
  totalVersato: number
  histogram: {
    rangeMin: number
    label: string
    count: number
    aboveTarget: boolean
  }[]
}

/** Normal distribution sample via Box-Muller transform. */
export function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export function runSimulation(
  initialCapital: number,
  annualContrib: number,
  years: number,
  rendimento: number,
  volatilita: number,
  targetCapital: number,
): SimResult {
  const finals: number[] = []

  for (let i = 0; i < N_SIMULAZIONI; i++) {
    let v = initialCapital
    for (let y = 0; y < years; y++) {
      v += annualContrib
      v *= 1 + rendimento + volatilita * randn()
      if (v < 0) v = 0
    }
    finals.push(v)
  }

  finals.sort((a, b) => a - b)

  const p10 = finals[Math.floor(N_SIMULAZIONI * 0.1)]
  const p50 = finals[Math.floor(N_SIMULAZIONI * 0.5)]
  const p90 = finals[Math.floor(N_SIMULAZIONI * 0.9)]

  const target = targetCapital
  const successCount = finals.filter((v) => v >= target).length
  const successRate = (successCount / N_SIMULAZIONI) * 100
  const totalVersato = initialCapital + annualContrib * years

  const minVal = finals[Math.floor(N_SIMULAZIONI * 0.01)]
  const maxVal = finals[Math.floor(N_SIMULAZIONI * 0.99)]
  const bucketSize = (maxVal - minVal) / N_BUCKETS

  const counts = new Array<number>(N_BUCKETS).fill(0)
  for (const v of finals) {
    const idx = Math.min(
      N_BUCKETS - 1,
      Math.max(0, Math.floor((v - minVal) / bucketSize)),
    )
    counts[idx]++
  }

  const histogram = counts.map((count, i) => {
    const rangeMin = minVal + i * bucketSize
    const midpoint = rangeMin + bucketSize / 2
    return {
      rangeMin,
      label: tickY(midpoint),
      count,
      aboveTarget: midpoint >= target,
    }
  })

  return { p10, p50, p90, successRate, target, totalVersato, histogram }
}
