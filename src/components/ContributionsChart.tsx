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
import { type ContributionColumn } from '@/lib/providerConfig'
import { chartColors } from '@/lib/chartColors'

interface YearRow {
  year: number
  aderente: number
  azienda: number
  tfr: number
  altro: number
  fees: number
}

interface Props {
  yearRows: YearRow[]
  columns: ContributionColumn[]
}

export const ContributionsChart = React.memo(function ContributionsChart({ yearRows, columns }: Props) {
  const data = React.useMemo(
    () => yearRows.map(r => {
      const entry: Record<string, number> = { year: r.year }
      for (const col of columns) entry[col.label] = Math.round(r[col.key])
      entry['Spese'] = Math.round(Math.abs(r.fees))
      return entry
    }),
    [yearRows, columns],
  )

  return (
    <div role="img" aria-label="Grafico: contributi versati per anno">
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="30%" barGap={2}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: chartColors.axis }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={tickY}
          tick={{ fontSize: 11, fill: chartColors.axis }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<ChartTooltip labelPrefix="" colorProp="fill" />} cursor={{ fill: 'var(--color-surface-container)' }} />
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, color: chartColors.axis, paddingTop: 8 }} />
        {columns.map(col => (
          <Bar key={col.key} dataKey={col.label} fill={col.chartFill} radius={[4, 4, 0, 0]} />
        ))}
        <Bar dataKey="Spese" fill={chartColors.contribution.fees} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
})
