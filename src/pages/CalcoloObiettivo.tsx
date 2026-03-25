import * as React from 'react'
import { useMeta } from '@/lib/useMeta'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Alert, Divider, Input } from 'antd'
import { Card } from 'antd'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { fmtEur, fmtEurRound, tickY } from '@/lib/formatters'
import { parseEur, parseRate } from '@/lib/parse'
import { chartColors } from '@/lib/chartColors'

// ── Calculation ───────────────────────────────────────────────────────────────

/**
 * Annual payment (P) needed to reach a future value (FV) given:
 *   - r: annual interest rate as decimal
 *   - n: number of years
 * Formula: P = (FV * r) / ((1 + r)^n - 1)
 * Edge case r = 0: P = FV / n
 */
function calcolaVersamento(fv: number, r: number, n: number): number {
  if (n <= 0) return NaN
  if (fv <= 0) return NaN
  if (r === 0) return fv / n
  return (fv * r) / (Math.pow(1 + r, n) - 1)
}

// ── Chart ─────────────────────────────────────────────────────────────────────

interface ChartProps {
  versamento: number
  r: number
  n: number
  fv: number
}

const AccumuloChart = React.memo(function AccumuloChart({ versamento, r, n, fv }: ChartProps) {
  const data = React.useMemo(() => {
    const points: { anno: number; 'Capitale accumulato': number; 'Versato totale': number }[] = [
      { anno: 0, 'Capitale accumulato': 0, 'Versato totale': 0 },
    ]
    let balance = 0
    for (let y = 1; y <= n; y++) {
      balance = (balance + versamento) * (1 + r)
      points.push({
        anno: y,
        'Capitale accumulato': Math.round(balance),
        'Versato totale': Math.round(versamento * y),
      })
    }
    return points
  }, [versamento, r, n])

  const yMax = Math.ceil(fv / 10_000) * 10_000 || 10_000

  return (
    <div role="img" aria-label="Grafico: accumulo del capitale nel tempo">
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 2" />
        <XAxis
          dataKey="anno"
          tickFormatter={v => v === 0 ? 'Oggi' : `+${v}y`}
          tick={{ fontSize: 11, fill: chartColors.axis }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, yMax]}
          tickFormatter={tickY}
          tick={{ fontSize: 11, fill: chartColors.axis }}
          axisLine={false}
          tickLine={false}
          width={62}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: chartColors.axis, paddingTop: 8 }} />
        <ReferenceLine y={fv} stroke={chartColors.error} strokeDasharray="6 3" label={{ value: 'Obiettivo', position: 'insideTopRight', fontSize: 10, fill: chartColors.error }} />
        <Line type="monotone" dataKey="Versato totale" stroke={chartColors.grid} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="Capitale accumulato" stroke={chartColors.success} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
})

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalcoloObiettivo() {
  useMeta(
    'Calcola quanto versare per raggiungere il tuo obiettivo pensionistico',
    'Inserisci il capitale che vuoi raggiungere alla pensione: la calcolatrice ti dice esattamente quanto versare ogni anno e ogni mese nel fondo pensione complementare.',
  )
  const [capitaleInput,  setCapitaleInput]  = React.useState('150.000')
  const [tassoInput,     setTassoInput]     = React.useState('3')
  const [anniInput,      setAnniInput]      = React.useState('30')

  const fv   = parseEur(capitaleInput) || 0
  const r    = parseRate(tassoInput)
  const n    = Math.min(Math.max(1, parseInt(anniInput) || 1), 50)

  const versamento  = calcolaVersamento(fv, r, n)
  const versateTot  = isNaN(versamento) ? 0 : Math.round(versamento * n)
  const interessi   = isNaN(versamento) ? 0 : Math.round(fv - versateTot)
  const valid       = !isNaN(versamento) && isFinite(versamento) && versamento > 0

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-[36px] leading-[44px] font-normal">Non avrò mai una pensione</h1>
        <p className="mt-2 text-muted-foreground">
          Quanto devo mettere da parte ogni anno per smettere di lavorare?
        </p>
      </header>

      <Alert
        type="info"
        showIcon
        className="mb-8"
        description={
          <p>
            In questa pagina cerchiamo di capire, numeri alla mano, quali sono le tue esigenze.
            In base al risultato finale che vuoi ottenere, la pagina ti guiderà step by step
            per capire cosa devi fare per raggiungere il tuo obiettivo.
          </p>
        }
      />

      <Divider className="mb-8" />

      {/* Inputs */}
      <div>
        <h2 className="text-[22px] leading-[28px] font-medium mb-4">Il tuo obiettivo</h2>
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="capitale" className="text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground">
              Capitale obiettivo (€)
            </label>
            <Input
              id="capitale"
              value={capitaleInput}
              onChange={e => setCapitaleInput(e.target.value)}
              placeholder="500.000"
              className="font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="tasso" className="text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground">
              Rendimento annuo atteso (%)
            </label>
            <Input
              id="tasso"
              value={tassoInput}
              onChange={e => setTassoInput(e.target.value)}
              placeholder="5"
              className="font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="anni" className="text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground">
              Anni disponibili
            </label>
            <Input
              id="anni"
              type="number"
              min={1}
              max={50}
              value={anniInput}
              onChange={e => setAnniInput(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground mb-8">
          Usa il formato italiano per il capitale: punto come separatore migliaia (es. 500.000).
        </p>
      </div>

      {/* Result */}
      {valid && (
        <>
          <Divider className="mb-8" />

          <div>
            <h2 className="text-[22px] leading-[28px] font-medium mb-4">Risultato</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card>
                <div className="pb-2">
                  <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Versamento annuale necessario</p>
                  <div className="text-[28px] leading-[36px] font-bold">{fmtEur.format(versamento)}</div>
                </div>
                <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">da investire ogni anno per {n} anni</p>
              </Card>
              <Card>
                <div className="pb-2">
                  <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Totale versato di tasca tua</p>
                  <div className="text-[28px] leading-[36px] font-bold">{fmtEurRound.format(versateTot)}</div>
                </div>
                <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">{n} × {fmtEurRound.format(Math.round(versamento))}</p>
              </Card>
              <Card>
                <div className="pb-2">
                  <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Versamento mensile necessario</p>
                  <div className="text-[28px] leading-[36px] font-bold">{fmtEur.format(versamento / 12)}</div>
                </div>
                <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">versamento annuale ÷ 12</p>
              </Card>
              <Card>
                <div className="pb-2">
                  <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">Interessi generati</p>
                  <div className="text-[28px] leading-[36px] font-bold">{fmtEurRound.format(interessi)}</div>
                </div>
                <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">obiettivo {fmtEurRound.format(fv)} − versato</p>
              </Card>
            </div>

            <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground mb-8">
              Questo calcolo assume un rendimento costante e versamenti annuali a fine periodo.
            </p>
          </div>

          <Divider className="mb-8" />

          {/* Chart */}
          <div>
            <h2 className="text-[22px] leading-[28px] font-medium mb-4">Proiezione dell'accumulo</h2>
            <AccumuloChart versamento={versamento} r={r} n={n} fv={fv} />
          </div>
        </>
      )}

    </div>
  )
}
