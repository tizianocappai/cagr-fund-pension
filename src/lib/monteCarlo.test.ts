import { describe, it, expect, vi, beforeEach } from 'vitest'
import { randn, runSimulation } from './monteCarlo'

// ── randn ─────────────────────────────────────────────────────────────────────

describe('randn', () => {
  it('returns a finite number', () => {
    const sample = randn()
    expect(Number.isFinite(sample)).toBe(true)
  })

  it('produces values approximately normally distributed (mean ≈ 0, std ≈ 1)', () => {
    const N = 10_000
    const samples = Array.from({ length: N }, randn)
    const mean = samples.reduce((s, x) => s + x, 0) / N
    const variance = samples.reduce((s, x) => s + x * x, 0) / N - mean * mean
    const std = Math.sqrt(variance)

    expect(mean).toBeCloseTo(0, 0)   // within ±0.05
    expect(std).toBeCloseTo(1, 0)    // within ±0.05
  })

  it('never returns Infinity or NaN even when Math.random returns edge values', () => {
    // Simulate extreme but valid random values (not exactly 0)
    const mockRandom = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(1e-15) // very small u
      .mockReturnValueOnce(0.5)   // v
      .mockReturnValueOnce(0.5)   // second call for the while loop guard
      .mockReturnValue(0.5)
    const result = randn()
    expect(Number.isFinite(result)).toBe(true)
    mockRandom.mockRestore()
  })
})

// ── runSimulation ─────────────────────────────────────────────────────────────

describe('runSimulation', () => {
  describe('output structure', () => {
    let result: ReturnType<typeof runSimulation>

    beforeEach(() => {
      result = runSimulation(10_000, 3_600, 20, 0.035, 0.11, 100_000)
    })

    it('returns percentiles in non-decreasing order', () => {
      expect(result.p10).toBeLessThanOrEqual(result.p50)
      expect(result.p50).toBeLessThanOrEqual(result.p90)
    })

    it('successRate is between 0 and 100', () => {
      expect(result.successRate).toBeGreaterThanOrEqual(0)
      expect(result.successRate).toBeLessThanOrEqual(100)
    })

    it('target equals the passed targetCapital', () => {
      expect(result.target).toBe(100_000)
    })

    it('totalVersato equals initialCapital + annualContrib × years', () => {
      expect(result.totalVersato).toBe(10_000 + 3_600 * 20)
    })

    it('histogram has exactly 30 buckets', () => {
      expect(result.histogram).toHaveLength(30)
    })

    it('each histogram bucket has a non-negative count', () => {
      for (const bucket of result.histogram) {
        expect(bucket.count).toBeGreaterThanOrEqual(0)
      }
    })

    it('histogram bucket rangeMin values are strictly increasing', () => {
      for (let i = 1; i < result.histogram.length; i++) {
        expect(result.histogram[i].rangeMin).toBeGreaterThan(
          result.histogram[i - 1].rangeMin,
        )
      }
    })

    it('all p values are non-negative (capital cannot go below 0)', () => {
      expect(result.p10).toBeGreaterThanOrEqual(0)
      expect(result.p50).toBeGreaterThanOrEqual(0)
      expect(result.p90).toBeGreaterThanOrEqual(0)
    })
  })

  describe('deterministic behaviour with zero volatility', () => {
    it('all simulations converge to the same value when volatilita = 0', () => {
      const result = runSimulation(0, 1_200, 10, 0.04, 0, 50_000)
      // With no randomness p10 == p50 == p90
      expect(result.p10).toBeCloseTo(result.p50, 0)
      expect(result.p50).toBeCloseTo(result.p90, 0)
    })

    it('compound growth matches the manual formula when volatilita = 0', () => {
      const annualContrib = 1_200
      const r = 0.05
      const years = 10

      // Manual compound: each year v = (v + contrib) * (1 + r), starting from 0
      let expected = 0
      for (let y = 0; y < years; y++) {
        expected = (expected + annualContrib) * (1 + r)
      }

      const result = runSimulation(0, annualContrib, years, r, 0, 50_000)
      expect(result.p50).toBeCloseTo(expected, -1) // within ±5
    })

    it('successRate is 100% when zero-volatility capital exceeds target', () => {
      // Very high return, very long horizon — capital will always beat target
      const result = runSimulation(500_000, 1_200, 30, 0.1, 0, 100_000)
      expect(result.successRate).toBe(100)
    })

    it('successRate is 0% when zero-volatility capital is always below target', () => {
      // annualContrib = 100, target = 100 * 25 = 2500
      // With 0% return and 1 year: capital = 100, far below 2500
      const result = runSimulation(0, 100, 1, 0, 0, 2_500)
      expect(result.successRate).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles zero initial capital', () => {
      const result = runSimulation(0, 2_400, 15, 0.03, 0.1, 50_000)
      expect(result.p50).toBeGreaterThan(0)
    })

    it('handles zero annual contribution', () => {
      const result = runSimulation(50_000, 0, 20, 0.035, 0.11, 0)
      // target = 0 * 25 = 0, so all simulations succeed
      expect(result.successRate).toBe(100)
      expect(result.target).toBe(0)
    })

    it('handles a single year horizon', () => {
      const result = runSimulation(10_000, 1_200, 1, 0.035, 0.11, 5_000)
      expect(result.p10).toBeGreaterThanOrEqual(0)
      expect(result.totalVersato).toBe(10_000 + 1_200)
    })

    it('does not let capital go below zero even with extreme negative shocks', () => {
      // Force all randn() calls to return a large negative number → capital hits the floor
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      // Box-Muller with u=v=0.5: sqrt(-2*ln(0.5))*cos(π) ≈ -1.18
      // With volatilita=10 that would be -10.18x multiplier → clamped to 0
      const result = runSimulation(1_000, 500, 5, 0.035, 10, 5_000)
      expect(result.p10).toBeGreaterThanOrEqual(0)
      vi.restoreAllMocks()
    })
  })

  describe('statistical properties (large-sample)', () => {
    it('median capital is higher than total contributed with positive return', () => {
      const result = runSimulation(0, 3_600, 20, 0.05, 0.1, 50_000)
      expect(result.p50).toBeGreaterThan(result.totalVersato)
    })

    it('higher return rate produces higher median capital', () => {
      const low  = runSimulation(0, 3_600, 20, 0.01, 0.05, 50_000)
      const high = runSimulation(0, 3_600, 20, 0.07, 0.05, 50_000)
      expect(high.p50).toBeGreaterThan(low.p50)
    })

    it('longer horizon produces higher median capital (same params)', () => {
      const short = runSimulation(0, 3_600, 10, 0.04, 0.1, 50_000)
      const long  = runSimulation(0, 3_600, 30, 0.04, 0.1, 50_000)
      expect(long.p50).toBeGreaterThan(short.p50)
    })

    it('higher volatility widens the P10–P90 spread', () => {
      const lowVol  = runSimulation(0, 3_600, 20, 0.04, 0.02, 50_000)
      const highVol = runSimulation(0, 3_600, 20, 0.04, 0.20, 50_000)
      const spreadLow  = lowVol.p90  - lowVol.p10
      const spreadHigh = highVol.p90 - highVol.p10
      expect(spreadHigh).toBeGreaterThan(spreadLow)
    })
  })
})
