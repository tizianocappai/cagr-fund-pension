import * as React from 'react'
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
import { Input } from '@/components/ui/input'

interface Props {
  currentValue: number
  defaultAderente: number
  defaultAzienda: number
  defaultTfr: number
}

const fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

/**
 * Year-by-year simulation:
 *   year 0 → currentValue
 *   year N → (prev + annualContrib) * (1 + r)
 * Contributions are added at the start of each year so they compound for the full year.
 */
function simulate(start: number, annualContrib: number, r: number, years: number): number[] {
  const out = [Math.round(start)]
  let v = start
  for (let t = 1; t <= years; t++) {
    v = (v + annualContrib) * (1 + r)
    out.push(Math.round(v))
  }
  return out
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[--radius] border border-[--color-border] bg-[--color-card] px-3 py-2 text-xs shadow-sm min-w-45">
      <p className="font-semibold mb-1.5">Anno +{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex justify-between gap-4" style={{ color: p.stroke }}>
          <span>{p.name}</span>
          <span className="font-mono">{fmt.format(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

const LINES = [
  { key: '📈 Solo crescita', color: '#6366f1', width: 2   },
  { key: '👤 + Aderente',    color: '#3b82f6', width: 2   },
  { key: '🏢 + Azienda',     color: '#10b981', width: 2   },
  { key: '📦 + TFR',         color: '#f59e0b', width: 2   },
  { key: '💰 Totale',        color: '#e11d48', width: 3   },
] as const

export function ForecastChart({ currentValue, defaultAderente, defaultAzienda, defaultTfr }: Props) {
  const [years, setYears]       = React.useState('20')
  const [rate, setRate]         = React.useState('3')
  const [aderente, setAderente] = React.useState(() => String(Math.round(defaultAderente)))
  const [azienda, setAzienda]   = React.useState(() => String(Math.round(defaultAzienda)))
  const [tfr, setTfr]           = React.useState(() => String(Math.round(defaultTfr)))

  const forecastYears = Math.min(Math.max(1, parseInt(years) || 20), 50)
  const r             = Math.max(0, parseNum(rate)) / 100
  const cAderente     = parseNum(aderente)
  const cAzienda      = parseNum(azienda)
  const cTfr          = parseNum(tfr)

  const s0 = simulate(currentValue, 0,                           r, forecastYears)
  const s1 = simulate(currentValue, cAderente,                   r, forecastYears)
  const s2 = simulate(currentValue, cAderente + cAzienda,        r, forecastYears)
  const s3 = simulate(currentValue, cAderente + cAzienda + cTfr, r, forecastYears)

  const data = s0.map((_, t) => ({
    year: t,
    '📈 Solo crescita': s0[t],
    '👤 + Aderente':    s1[t],
    '🏢 + Azienda':     s2[t],
    '📦 + TFR':         s3[t],
    '💰 Totale':        s3[t],
  }))

  const maxVal = data[data.length - 1]['📦 + TFR']
  const yMax   = Math.ceil(maxVal / 10000) * 10000

  function tickY(v: number) {
    if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000)     return `€${(v / 1_000).toFixed(0)}k`
    return `€${v}`
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-rate" className="text-xs text-[--color-muted-foreground]">
            📊 Tasso annuo (%)
          </label>
          <Input id="fc-rate" value={rate} onChange={e => setRate(e.target.value)}
            className="font-mono" placeholder="3" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-aderente" className="text-xs text-[--color-muted-foreground]">
            👤 Contributo aderente/anno (€)
          </label>
          <Input id="fc-aderente" value={aderente} onChange={e => setAderente(e.target.value)}
            className="font-mono" placeholder="0" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-azienda" className="text-xs text-[--color-muted-foreground]">
            🏢 Contributo datore/anno (€)
          </label>
          <Input id="fc-azienda" value={azienda} onChange={e => setAzienda(e.target.value)}
            className="font-mono" placeholder="0" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-tfr" className="text-xs text-[--color-muted-foreground]">
            📦 TFR/anno (€)
          </label>
          <Input id="fc-tfr" value={tfr} onChange={e => setTfr(e.target.value)}
            className="font-mono" placeholder="0" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="fc-years" className="text-xs text-[--color-muted-foreground] whitespace-nowrap">
          ⏳ Anni di proiezione
        </label>
        <Input id="fc-years" type="number" min={1} max={50} value={years}
          onChange={e => setYears(e.target.value)} className="w-24 font-mono" />
        <span className="text-xs text-[--color-muted-foreground]">max 50</span>
      </div>

      <p className="text-xs text-[--color-muted-foreground]">
        Ogni anno i contributi vengono aggiunti al valore corrente e l'intero importo cresce al tasso impostato. I contributi sono pre-compilati con la media annua storica. Le linee sono cumulative: ogni curva aggiunge una voce alla precedente.
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 2" />
          <XAxis dataKey="year" tickFormatter={v => `+${v}y`}
            tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, yMax]} tickFormatter={tickY}
            tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="plainline" iconSize={16}
            wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
          <ReferenceLine y={currentValue} stroke="#d4d4d4" strokeDasharray="3 3"
            label={{ value: 'Oggi', position: 'insideTopLeft', fontSize: 10, fill: '#a3a3a3' }} />
          {LINES.map(({ key, color, width }, i) => (
            <Line key={key} type="monotone" dataKey={key}
              stroke={color} strokeWidth={width}
              strokeDasharray={i === 0 ? '5 3' : undefined}
              dot={false} activeDot={{ r: 5, fill: color }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
