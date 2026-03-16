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
  xirr: number
  xirrNoAzienda: number
}

const fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[--radius] border border-[--color-border] bg-[--color-card] px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold mb-1">Anno +{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke }}>
          {p.name}: {fmt.format(p.value)}
        </p>
      ))}
    </div>
  )
}

export function ForecastChart({ currentValue, xirr, xirrNoAzienda }: Props) {
  const [years, setYears] = React.useState('20')

  const forecastYears = Math.min(Math.max(1, parseInt(years) || 20), 50)

  const data = Array.from({ length: forecastYears + 1 }, (_, i) => ({
    year: i,
    '📊 CAGR standard': Math.round(currentValue * Math.pow(1 + xirr, i)),
    '🚀 CAGR senza azienda': Math.round(currentValue * Math.pow(1 + xirrNoAzienda, i)),
  }))

  const maxVal = data[data.length - 1]['🚀 CAGR senza azienda']
  const yMax = Math.ceil(maxVal / 10000) * 10000

  function tickY(v: number) {
    if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}k`
    return `€${v}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label
          htmlFor="forecast-years"
          className="text-xs tracking-widest uppercase text-[--color-muted-foreground] whitespace-nowrap"
        >
          ⏳ Anni di proiezione
        </label>
        <Input
          id="forecast-years"
          type="number"
          min={1}
          max={50}
          value={years}
          onChange={e => setYears(e.target.value)}
          className="w-24 font-mono"
          aria-describedby="forecast-years-hint"
        />
        <span id="forecast-years-hint" className="text-xs text-[--color-muted-foreground]">max 50</span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 2" />
          <XAxis
            dataKey="year"
            tickFormatter={v => `+${v}y`}
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
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="plainline"
            iconSize={16}
            wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }}
          />
          <ReferenceLine
            y={currentValue}
            stroke="#d4d4d4"
            strokeDasharray="3 3"
            label={{ value: 'Oggi', position: 'insideTopLeft', fontSize: 10, fill: '#a3a3a3' }}
          />
          <Line
            type="monotone"
            dataKey="📊 CAGR standard"
            stroke="#0a0a0a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#0a0a0a' }}
          />
          <Line
            type="monotone"
            dataKey="🚀 CAGR senza azienda"
            stroke="#525252"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: '#525252' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
