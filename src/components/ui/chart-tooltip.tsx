import { fmtEurRound } from '@/lib/formatters'

interface TooltipEntry {
  dataKey: string
  name: string
  value: number
  fill?: string
  stroke?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  /** Text shown before the label value. Defaults to "Anno". */
  labelPrefix?: string
  /** Which color property to use for each row. 'fill' for bar charts, 'stroke' for line charts. */
  colorProp?: 'fill' | 'stroke'
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelPrefix = 'Anno',
  colorProp = 'stroke',
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm min-w-44">
      <p className="font-semibold mb-1.5">{labelPrefix} {label}</p>
      {payload.map(p => (
        <p
          key={p.dataKey}
          className="flex justify-between gap-4"
          style={{ color: colorProp === 'fill' ? p.fill : p.stroke }}
        >
          <span>{p.name}</span>
          <span className="font-mono">{fmtEurRound.format(p.value)}</span>
        </p>
      ))}
    </div>
  )
}
