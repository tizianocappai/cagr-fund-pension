import * as React from 'react'
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
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { tickY } from '@/lib/formatters'

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

export const ContributionsChart = React.memo(function ContributionsChart({ yearRows }: Props) {
  const data = React.useMemo(
    () => yearRows.map(r => ({
      year: r.year,
      '👤 Aderente': Math.round(r.aderente),
      '🏢 Azienda':  Math.round(r.azienda),
      '📦 TFR':      Math.round(r.tfr),
      '🏦 Spese':    Math.round(Math.abs(r.fees)),
    })),
    [yearRows],
  )

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
          tickFormatter={tickY}
          tick={{ fontSize: 11, fill: '#737373' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          content={<ChartTooltip labelPrefix="📅" colorProp="fill" />}
          cursor={{ fill: '#f3f2f1' }}
        />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }}
        />
        <Bar dataKey="👤 Aderente" fill="#3b82f6" />
        <Bar dataKey="🏢 Azienda"  fill="#10b981" />
        <Bar dataKey="📦 TFR"      fill="#f59e0b" />
        <Bar dataKey="🏦 Spese"    fill="#f43f5e" />
      </BarChart>
    </ResponsiveContainer>
  )
})
