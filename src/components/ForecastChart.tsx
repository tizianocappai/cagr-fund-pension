import * as React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Input } from '@/components/ui/input'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { tickY } from '@/lib/formatters'
import { parseEur, parseRate } from '@/lib/parse'

export type Flow = 'cometa' | 'fonte'

interface Props {
  flow: Flow
  defaultAderente: number
  defaultAzienda: number
  defaultTfr: number
}

/**
 * Compound interest accumulation starting from 0.
 * Each year: balance = (balance + annualContrib) * (1 + rate).
 * Returns an array of length (years + 1) where index 0 = 0.
 */
function compound(annualContrib: number, rate: number, years: number): number[] {
  const out: number[] = [0]
  let v = 0
  for (let y = 1; y <= years; y++) {
    v = (v + annualContrib) * (1 + rate)
    out.push(Math.round(v))
  }
  return out
}

export const ForecastChart = React.memo(function ForecastChart({
  flow: _flow,
  defaultAderente,
  defaultAzienda,
  defaultTfr,
}: Props) {
  const [rate,     setRate]     = React.useState('3')
  const [aderente, setAderente] = React.useState(() => String(Math.round(defaultAderente)))
  const [azienda,  setAzienda]  = React.useState(() => String(Math.round(defaultAzienda)))
  const [tfr,      setTfr]      = React.useState(() => String(Math.round(defaultTfr)))
  const [years,    setYears]    = React.useState('20')

  const r           = parseRate(rate)
  const cAderente   = parseEur(aderente)
  const cAzienda    = parseEur(azienda)
  const cTfr        = parseEur(tfr)
  const forecastYrs = Math.min(Math.max(1, parseInt(years) || 20), 50)

  const { data, yMax } = React.useMemo(() => {
    const totalAnnual = cAderente + cAzienda + cTfr
    const sTotal      = compound(totalAnnual, r, forecastYrs)

    const points: { anno: number; [k: string]: number }[] = []
    for (let y = 0; y <= forecastYrs; y++) {
      points.push({
        anno:      y,
        Aderente:  Math.round(cAderente * y),
        Azienda:   Math.round(cAzienda  * y),
        TFR:       Math.round(cTfr      * y),
        Totale:    sTotal[y],
      })
    }

    const maxVal = sTotal[sTotal.length - 1]
    return { data: points, yMax: Math.ceil(maxVal / 10_000) * 10_000 || 10_000 }
  }, [r, cAderente, cAzienda, cTfr, forecastYrs])

  return (
    <div className="flex flex-col gap-5">

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-rate" className="text-xs text-muted-foreground">Rendimento medio annuo (%)</label>
          <Input id="fc-rate" value={rate} onChange={e => setRate(e.target.value)} placeholder="3" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-years" className="text-xs text-muted-foreground">Anni di proiezione</label>
          <Input id="fc-years" type="number" min={1} max={50} value={years} onChange={e => setYears(e.target.value)} className="font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-aderente" className="text-xs text-muted-foreground">Contributo aderente / anno (€)</label>
          <Input id="fc-aderente" value={aderente} onChange={e => setAderente(e.target.value)} placeholder="0" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-azienda" className="text-xs text-muted-foreground">Contributo azienda / anno (€)</label>
          <Input id="fc-azienda" value={azienda} onChange={e => setAzienda(e.target.value)} placeholder="0" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-tfr" className="text-xs text-muted-foreground">TFR / anno (€)</label>
          <Input id="fc-tfr" value={tfr} onChange={e => setTfr(e.target.value)} placeholder="0" className="font-mono" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Ogni linea mostra come cresce nel tempo quella singola fonte di contributo, partendo da zero,
        al tasso di rendimento impostato. La linea <strong className="text-foreground">Totale</strong> è
        l'interesse composto applicato alla somma di tutti i contributi annui ed equivale al patrimonio
        accumulato dai versamenti futuri.
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 2" />
          <XAxis
            dataKey="anno"
            tickFormatter={v => v === 0 ? 'Oggi' : `+${v}y`}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={tickY}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
            width={62}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
          <Line type="monotone" dataKey="Aderente" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="Azienda"  stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="TFR"      stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="Totale"   stroke="#e11d48" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})
