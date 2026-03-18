import { parseItalianNumber } from './parse'
import type { Transaction } from './parseXls'

/**
 * Maps quarter number (1–4) and year to the last day of that quarter.
 *   Q1 (gen–mar) → 31 marzo
 *   Q2 (apr–giu) → 30 giugno
 *   Q3 (lug–set) → 30 settembre
 *   Q4 (ott–dic) → 31 dicembre
 */
function quarterToDate(quarter: number, year: number): Date {
  const map: Record<number, [number, number]> = {
    1: [2, 31],
    2: [5, 30],
    3: [8, 30],
    4: [11, 31],
  }
  const [month, day] = map[quarter] ?? [11, 31]
  return new Date(year, month, day)
}

export function parseFonte(rows: string[][]): Transaction[] {
  const transactions: Transaction[] = []

  for (const cells of rows) {
    if (cells.length < 7) continue

    const text = (i: number) => cells[i] ?? ''

    const quarter = parseInt(text(0))  // col A: quadrimestre 1–4
    const year    = parseInt(text(1))  // col B: anno

    if (isNaN(quarter) || isNaN(year) || quarter < 1 || quarter > 4) continue

    const aziendaNome = text(3)        // col D: nome azienda

    const dataOperazione       = quarterToDate(quarter, year)
    const importoLordoAderente = parseItalianNumber(text(4))  // col E
    const importoLordoAzienda  = parseItalianNumber(text(5))  // col F
    const tfr                  = parseItalianNumber(text(6))  // col G

    // col H–L (index 7–11): premi aggiuntivi → somma in "altro"
    const altro = [7, 8, 9, 10, 11]
      .map(i => parseItalianNumber(text(i)))
      .reduce((s, n) => s + n, 0)

    const net = importoLordoAderente + importoLordoAzienda + tfr + altro

    if (net === 0) continue

    transactions.push({
      tipoOperazione: aziendaNome || 'Versamento',
      dataOperazione,
      trimestreComp: `Q${quarter} ${year}`,
      importoLordoAderente,
      importoLordoAzienda,
      tfr,
      altro,
      quotaSpese: 0,
      net,
    })
  }

  return transactions
}
