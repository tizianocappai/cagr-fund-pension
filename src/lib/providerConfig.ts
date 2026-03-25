import { chartColors } from './chartColors'

export type Provider = 'cometa' | 'fonte' | 'amundi'

export interface ContributionColumn {
  key: 'aderente' | 'azienda' | 'tfr' | 'altro'
  label: string
  chartFill: string
}

const BASE_COLUMNS: ContributionColumn[] = [
  { key: 'aderente', label: 'Aderente', chartFill: chartColors.contribution.aderente },
  { key: 'azienda',  label: 'Azienda',  chartFill: chartColors.contribution.azienda },
  { key: 'tfr',      label: 'TFR',      chartFill: chartColors.contribution.tfr },
]

export const columnsByProvider: Record<Provider, ContributionColumn[]> = {
  cometa: BASE_COLUMNS,
  fonte:  BASE_COLUMNS,
  amundi: [...BASE_COLUMNS, { key: 'altro', label: 'Altro', chartFill: chartColors.contribution.altro }],
}
