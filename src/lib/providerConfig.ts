export type Provider = 'cometa' | 'fonte' | 'amundi'

export interface ContributionColumn {
  key: 'aderente' | 'azienda' | 'tfr' | 'altro'
  label: string
  chartFill: string
}

const BASE_COLUMNS: ContributionColumn[] = [
  { key: 'aderente', label: 'Aderente', chartFill: '#3b82f6' },
  { key: 'azienda',  label: 'Azienda',  chartFill: '#10b981' },
  { key: 'tfr',      label: 'TFR',      chartFill: '#f59e0b' },
]

export const columnsByProvider: Record<Provider, ContributionColumn[]> = {
  cometa: BASE_COLUMNS,
  fonte:  BASE_COLUMNS,
  amundi: [...BASE_COLUMNS, { key: 'altro', label: 'Altro', chartFill: '#8b5cf6' }],
}
