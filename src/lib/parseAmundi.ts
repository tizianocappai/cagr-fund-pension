import { parseItalianNumber } from './parse'
import type { Transaction } from './parseXls'

/**
 * Parses the date from column B.
 * Handles two formats:
 *  - String "DD/MM/YYYY" from .xls HTML table export
 *  - Excel serial number from .xlsx raw mode (days since Dec 30, 1899)
 */
function parseAmundiDate(value: string): Date | null {
  const trimmed = value.replace(/\u00a0/g, '').trim()
  if (!trimmed) return null

  // Excel serial number (e.g. "45291"): no slash, all digits
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const serial = parseFloat(trimmed)
    if (serial > 1000) {
      // Convert Excel serial to JS Date (epoch offset = 25569 days)
      const date = new Date(Math.round((serial - 25569) * 86400 * 1000))
      return isNaN(date.getTime()) ? null : date
    }
  }

  // Italian date string DD/MM/YYYY
  const parts = trimmed.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * Parser for Amundi SecondaPensione exports (.xls / .xlsx).
 *
 * Column mapping (0-indexed):
 *   B (1) — data operazione
 *   D (3) — importo lordo azienda
 *   E (4) — importo lordo aderente
 *   G (6) — TFR
 *   H (7) — altri contributi (Altro)
 *   I (8) — quota spese (negative = cost)
 */
export function parseAmundi(rows: string[][]): Transaction[] {
  const transactions: Transaction[] = []

  for (const cells of rows) {
    if (cells.length < 9) continue

    const text = (i: number) => cells[i] ?? ''

    const dataOperazione = parseAmundiDate(text(1))
    if (!dataOperazione) continue

    const importoLordoAzienda  = parseItalianNumber(text(3))
    const importoLordoAderente = parseItalianNumber(text(4))
    const tfr                  = parseItalianNumber(text(6))
    const altro                = parseItalianNumber(text(7))
    const quotaSpese           = parseItalianNumber(text(8))

    const net = importoLordoAderente + importoLordoAzienda + tfr + altro + quotaSpese

    if (net === 0) continue

    transactions.push({
      tipoOperazione: 'Versamento',
      dataOperazione,
      trimestreComp: '',
      importoLordoAderente,
      importoLordoAzienda,
      tfr,
      altro,
      quotaSpese,
      net,
    })
  }

  return transactions
}
