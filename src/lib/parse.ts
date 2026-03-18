/**
 * Parses an Italian-formatted number string.
 * Italian format: dot = thousands separator, comma = decimal ("1.234,56" → 1234.56).
 * Also handles plain decimal strings from SheetJS raw mode ("55.53" → 55.53).
 */
export function parseItalianNumber(s: string): number {
  const trimmed = s.replace(/\u00a0/g, '').replace(/\s/g, '')
  if (!trimmed) return 0
  if (trimmed.includes(',')) {
    const n = parseFloat(trimmed.replace(/\./g, '').replace(',', '.'))
    return isNaN(n) ? 0 : n
  }
  const n = parseFloat(trimmed)
  return isNaN(n) ? 0 : n
}

/**
 * Parses an Italian-formatted EUR input for user-facing fields
 * (e.g. "1.234,56" or "1235"). Returns 0 for invalid or negative values.
 */
export function parseEur(s: string): number {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n
}

/**
 * Parses a percentage string (e.g. "3,5" or "3.5") and returns a decimal rate (0.035).
 * Returns 0 for invalid or negative values.
 */
export function parseRate(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n / 100
}

/**
 * Parses an Italian-formatted portfolio value for validation purposes.
 * Returns NaN if the input is invalid so callers can distinguish empty/invalid from zero.
 */
export function parseItalianInput(s: string): number {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? NaN : n
}
