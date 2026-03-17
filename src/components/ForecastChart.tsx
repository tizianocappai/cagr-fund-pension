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

export type Flow = 'cometa' | 'fonte'

interface Props {
  flow: Flow
  defaultAderente: number
  defaultAzienda: number
  defaultTfr: number
}

const fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

/**
 * Compound interest accumulation starting from 0.
 * Each year: add annualContrib to the running balance, then apply rate.
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

function parseRate(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n / 100
}

function parseEur(s: string): number {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[--radius] border border-[--color-border] bg-[--color-card] px-3 py-2 text-xs shadow-sm min-w-44">
      <p className="font-semibold mb-1.5">Anno {label}</p>
      {[...payload].reverse().map((p: any) => (
        <p key={p.dataKey} className="flex justify-between gap-4" style={{ color: p.stroke }}>
          <span>{p.name}</span>
          <span className="font-mono">{fmt.format(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

const fmtTick = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 })
const fmtTickDec = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function tickY(v: number) {
  if (v >= 1_000_000) return `€${fmtTickDec.format(v / 1_000_000)}M`
  if (v >= 1_000)     return `€${fmtTick.format(v / 1_000)}k`
  return `€${fmtTick.format(v)}`
}

export function ForecastChart({ flow: _flow, defaultAderente, defaultAzienda, defaultTfr }: Props) {
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

  // Individual lines: linear accumulation (no interest), just cumulative contributions
  // Totale: compound interest — each year adds all contributions then applies rate
  const totalAnnual = cAderente + cAzienda + cTfr
  const sTotal      = compound(totalAnnual, r, forecastYrs)

  const data: { anno: number; [k: string]: number }[] = []
  for (let y = 0; y <= forecastYrs; y++) {
    data.push({
      anno:          y,
      '👤 Aderente': Math.round(cAderente * y),
      '🏢 Azienda':  Math.round(cAzienda  * y),
      '📦 TFR':      Math.round(cTfr      * y),
      '💰 Totale':   sTotal[y],
    })
  }

  const maxVal = sTotal[sTotal.length - 1]
  const yMax   = Math.ceil(maxVal / 10_000) * 10_000 || 10_000

  return (
    <div className="flex flex-col gap-5">

      {/* ── Inputs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-rate" className="text-xs text-[--color-muted-foreground]">
            📊 Rendimento medio annuo (%)
          </label>
          <Input
            id="fc-rate"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="3"
            className="font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-years" className="text-xs text-[--color-muted-foreground]">
            ⏳ Anni di proiezione
          </label>
          <Input
            id="fc-years"
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={e => setYears(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-aderente" className="text-xs text-[--color-muted-foreground]">
            👤 Contributo aderente / anno (€)
          </label>
          <Input
            id="fc-aderente"
            value={aderente}
            onChange={e => setAderente(e.target.value)}
            placeholder="0"
            className="font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-azienda" className="text-xs text-[--color-muted-foreground]">
            🏢 Contributo azienda / anno (€)
          </label>
          <Input
            id="fc-azienda"
            value={azienda}
            onChange={e => setAzienda(e.target.value)}
            placeholder="0"
            className="font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fc-tfr" className="text-xs text-[--color-muted-foreground]">
            📦 TFR / anno (€)
          </label>
          <Input
            id="fc-tfr"
            value={tfr}
            onChange={e => setTfr(e.target.value)}
            placeholder="0"
            className="font-mono"
          />
        </div>
      </div>

      <p className="text-xs text-[--color-muted-foreground]">
        Ogni linea mostra come cresce nel tempo quella singola fonte di contributo, partendo da zero,
        al tasso di rendimento impostato. La linea <strong className="text-[--color-foreground]">💰 Totale</strong> è
        l'interesse composto applicato alla somma di tutti i contributi annui ed equivale al patrimonio
        accumulato dai versamenti futuri.
      </p>

      {/* ── Chart ── */}
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="plainline"
            iconSize={16}
            wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }}
          />
          <Line type="monotone" dataKey="👤 Aderente" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="🏢 Azienda"  stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="📦 TFR"      stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="💰 Totale"   stroke="#e11d48" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
