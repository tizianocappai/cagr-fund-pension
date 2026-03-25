import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from 'antd'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { Alert } from 'antd'
import { chartColors } from '@/lib/chartColors'
import { fmtEur, fmtEurRound, tickY } from '@/lib/formatters'
import {
  calculateTER,
  calculateAverageCapital,
  calculateLostCapital,
  compareScenarios,
  estimateAnnualContribution,
  getCostBenchmark,
} from '@/lib/costAnalysis'
import type { Flow } from '@/components/ForecastChart'

interface Results {
  xirr: number
  totalFees: number
  currentValue: number
  years: number
  yearRows: Array<{
    year: number
    aderente: number
    azienda: number
    tfr: number
    altro: number
    fees: number
  }>
}

interface Props {
  results: Results
  flow: Flow
}

export function CostAnalysis({ results, flow }: Props) {
  // Calculate metrics
  const avgCapital = calculateAverageCapital(results.yearRows)
  const ter = calculateTER(Math.abs(results.totalFees), avgCapital, results.years)
  const benchmark = getCostBenchmark(flow)
  const currentYear = new Date().getFullYear()
  const costImpact = calculateLostCapital(results.yearRows, results.xirr, currentYear)

  // Future projections (30 years)
  const avgAnnualContribution = estimateAnnualContribution(results.yearRows)
  const optimizedTER = Math.max(0.002, benchmark.ter - 0.001) // Benchmark - 0.10%
  const [currentScenario, optimizedScenario] = compareScenarios(
    results.currentValue,
    avgAnnualContribution,
    30,
    ter,
    optimizedTER,
    results.xirr
  )

  const potentialSavings = optimizedScenario.finalCapital - currentScenario.finalCapital

  // TER comparison status
  const terDiff = ter - benchmark.ter
  const terStatus =
    terDiff > 0.002
      ? { label: 'Sopra media', color: 'text-error' }
      : terDiff < -0.001
        ? { label: 'Sotto media', color: 'text-success' }
        : { label: 'In linea', color: 'text-foreground' }

  // Chart data: yearly fees
  const feesChartData = results.yearRows.map(row => ({
    year: row.year,
    Spese: Math.round(Math.abs(row.fees)),
  }))

  // Chart data: future projection
  const projectionData = React.useMemo(() => {
    const points = []
    let capitalCurrent = results.currentValue
    let capitalOptimized = results.currentValue

    points.push({
      anno: 0,
      'Con TER attuale': Math.round(capitalCurrent),
      'Con TER ottimizzato': Math.round(capitalOptimized),
    })

    for (let year = 1; year <= 30; year++) {
      capitalCurrent += avgAnnualContribution
      capitalCurrent = capitalCurrent * (1 + results.xirr - ter)

      capitalOptimized += avgAnnualContribution
      capitalOptimized = capitalOptimized * (1 + results.xirr - optimizedTER)

      points.push({
        anno: year,
        'Con TER attuale': Math.round(capitalCurrent),
        'Con TER ottimizzato': Math.round(capitalOptimized),
      })
    }

    return points
  }, [results.currentValue, results.xirr, avgAnnualContribution, ter, optimizedTER])

  const projectionYMax = Math.ceil(projectionData[projectionData.length - 1]['Con TER ottimizzato'] / 10000) * 10000

  return (
    <div className="flex flex-col gap-6">
      {/* Info callout */}
      <Alert type="info" showIcon message="Cosa sono i costi?" description={
        <p>
          Il <strong>TER (Total Expense Ratio)</strong> misura il costo annuo del fondo come
          percentuale del patrimonio. Include commissioni di gestione, spese amministrative e altri
          oneri. Un TER più basso significa che una quota maggiore del tuo capitale lavora per te.
        </p>
      } />

      {/* TER Comparison */}
      <div>
        <h3 className="text-[16px] leading-[24px] tracking-[0.15px] font-medium mb-3">
          TER Confronto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <div className="pb-2">
              <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Il tuo TER</p>
              <div className="text-[28px] leading-[36px] font-bold">{(ter * 100).toFixed(2)}%</div>
            </div>
            <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">
              Costo effettivo annuo
            </p>
          </Card>

          <Card>
            <div className="pb-2">
              <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Media mercato</p>
              <div className="text-[28px] leading-[36px] font-bold">{(benchmark.ter * 100).toFixed(2)}%</div>
            </div>
            <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">
              {benchmark.label} ({benchmark.range})
            </p>
          </Card>

          <Card>
            <div className="pb-2">
              <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Valutazione</p>
              <div className={`text-[28px] leading-[36px] font-bold ${terStatus.color}`}>
                {terStatus.label}
              </div>
            </div>
            <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">
              {terDiff > 0
                ? `+${(terDiff * 100).toFixed(2)}pp sopra`
                : `${(terDiff * 100).toFixed(2)}pp sotto`}
            </p>
          </Card>
        </div>
      </div>

      {/* Historical Impact */}
      <div>
        <h3 className="text-[16px] leading-[24px] tracking-[0.15px] font-medium mb-3">
          Impatto Storico
        </h3>
        <div className="border border-border overflow-hidden">
          <table className="w-full text-[14px] leading-[20px] tracking-[0.25px]">
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 font-medium">Spese totali pagate</td>
                <td className="px-4 py-3 text-right font-mono text-error">
                  {fmtEur.format(costImpact.feesPaid)}
                </td>
              </tr>
              <tr className="border-b border-border bg-muted">
                <td className="px-4 py-3 font-medium">
                  Capitale perso
                  <span className="block text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground font-normal mt-1">
                    Se investite, le spese sarebbero cresciute a questo valore
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-error">
                  {fmtEur.format(costImpact.lostCapital)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 pl-8 text-muted-foreground">├─ Spese dirette</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {fmtEur.format(costImpact.feesPaid)} ({((costImpact.feesPaid / costImpact.lostCapital) * 100).toFixed(0)}%)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 pl-8 text-muted-foreground">└─ Rendimento mancato</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {fmtEur.format(costImpact.missedReturn)} ({((costImpact.missedReturn / costImpact.lostCapital) * 100).toFixed(0)}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground mt-2">
          Il "capitale perso" include sia le spese pagate che il rendimento che avresti ottenuto
          investendo quegli importi.
        </p>
      </div>

      {/* Future Projection */}
      <div>
        <h3 className="text-[16px] leading-[24px] tracking-[0.15px] font-medium mb-3">
          Proiezione Futura (30 anni)
        </h3>

        <Alert type="info" showIcon className="mb-4" description={
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold mb-2">Con TER attuale ({(ter * 100).toFixed(2)}%)</p>
                <div className="flex flex-col gap-1 text-[12px] leading-[16px] tracking-[0.4px]">
                  <div className="flex justify-between">
                    <span>Spese future stimate:</span>
                    <span className="font-mono">{fmtEurRound.format(currentScenario.totalFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capitale finale netto:</span>
                    <span className="font-mono font-bold">{fmtEurRound.format(currentScenario.finalCapital)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold mb-2">Con TER ottimizzato ({(optimizedTER * 100).toFixed(2)}%)</p>
                <div className="flex flex-col gap-1 text-[12px] leading-[16px] tracking-[0.4px]">
                  <div className="flex justify-between">
                    <span>Spese future stimate:</span>
                    <span className="font-mono">{fmtEurRound.format(optimizedScenario.totalFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capitale finale netto:</span>
                    <span className="font-mono font-bold">{fmtEurRound.format(optimizedScenario.finalCapital)}</span>
                  </div>
                </div>
              </div>
            </div>

            {potentialSavings > 1000 && (
              <div className="mt-3 pt-3 border-t border-primary">
                <p className="font-bold text-success">
                  Riducendo i costi potresti avere {fmtEurRound.format(potentialSavings)} in più
                  tra 30 anni!
                </p>
              </div>
            )}
          </>
        } />

        {/* Projection Chart */}
        <div role="img" aria-label="Grafico: proiezione costi futuri">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 2" />
              <XAxis
                dataKey="anno"
                tickFormatter={v => (v === 0 ? 'Oggi' : `+${v}y`)}
                tick={{ fontSize: 11, fill: chartColors.axis }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, projectionYMax]}
                tickFormatter={tickY}
                tick={{ fontSize: 11, fill: chartColors.axis }}
                axisLine={false}
                tickLine={false}
                width={62}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="plainline"
                iconSize={16}
                wrapperStyle={{ fontSize: 11, color: chartColors.axis, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="Con TER attuale"
                stroke={chartColors.projection.current}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Con TER ottimizzato"
                stroke={chartColors.projection.optimized}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground mt-2">
          Proiezione basata su: contributi annui medi di {fmtEurRound.format(avgAnnualContribution)},
          rendimento {(results.xirr * 100).toFixed(1)}% annuo. I valori sono indicativi.
        </p>
      </div>

      {/* Yearly Fees Evolution */}
      <div>
        <h3 className="text-[16px] leading-[24px] tracking-[0.15px] font-medium mb-3">
          Evoluzione Spese Anno per Anno
        </h3>

        <div role="img" aria-label="Grafico: spese pagate per anno">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={feesChartData} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: chartColors.axis }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `€${v}`}
                tick={{ fontSize: 11, fill: chartColors.axis }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Spese" fill={chartColors.contribution.fees} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {results.yearRows.length > 1 && (
          <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground mt-2">
            Trend: le spese crescono proporzionalmente al patrimonio investito
            {avgCapital > 0 &&
              ` (${((Math.abs(results.totalFees) / avgCapital / results.years) * 100).toFixed(2)}% annuo)`}
          </p>
        )}
      </div>
    </div>
  )
}
