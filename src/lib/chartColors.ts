/**
 * Material Design 3 color palette for charts
 * Provides consistent colors across all visualization components
 */

export const chartColors = {
  // Primary colors from M3 palette
  primary: '#6750A4',
  secondary: '#625B71',
  tertiary: '#7D5260',
  success: '#198754',
  warning: '#FFA726',
  error: '#B3261E',

  // Extended palette for multi-series charts
  palette: [
    '#6750A4', // primary
    '#625B71', // secondary
    '#7D5260', // tertiary
    '#198754', // success
    '#FFA726', // warning
    '#00897B', // teal
    '#5E35B1', // deep purple
    '#E91E63', // pink
  ],

  // Grid and axes
  grid: '#E7E0EC',
  axis: '#49454F',

  // Chart-specific role colors
  contribution: {
    aderente: '#6750A4', // primary
    azienda: '#198754',  // success
    tfr: '#FFA726',      // warning
    altro: '#625B71',    // secondary
    fees: '#B3261E',     // error
  },

  // Projection/forecast colors
  projection: {
    current: '#FFA726',  // warning (current scenario)
    optimized: '#198754', // success (optimized scenario)
    total: '#B3261E',    // error (total projection)
  },
} as const

export type ChartColors = typeof chartColors
