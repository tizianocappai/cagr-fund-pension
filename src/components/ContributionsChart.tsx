import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface YearRow {
  year: number
  aderente: number
  azienda: number
  tfr: number
  fees: number
}

interface Props {
  yearRows: YearRow[]
}

const fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[--radius] border border-[--color-border] bg-[--color-card] px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold mb-1">📅 {label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {fmt.format(p.value)}
        </p>
      ))}
    </div>
  )
}

export function ContributionsChart({ yearRows }: Props) {
  const data = yearRows.map(r => ({
    year: r.year,
    '👤 Aderente': Math.round(r.aderente),
    '🏢 Azienda': Math.round(r.azienda),
    '📦 TFR': Math.round(r.tfr),
    '🏦 Spese': Math.round(Math.abs(r.fees)),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="30%" barGap={2}>
        <CartesianGrid vertical={false} stroke="#e5e5e5" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#737373' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={v => `€${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(v / 1000)}k`}
          tick={{ fontSize: 11, fill: '#737373' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f4' }} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }}
        />
        <Bar dataKey="👤 Aderente" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="🏢 Azienda" fill="#10b981" radius={[2, 2, 0, 0]} />
        <Bar dataKey="📦 TFR" fill="#f59e0b" radius={[2, 2, 0, 0]} />
        <Bar dataKey="🏦 Spese" fill="#f43f5e" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
