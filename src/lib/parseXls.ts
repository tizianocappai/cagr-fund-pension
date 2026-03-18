import { parseItalianNumber } from './parse'

export interface Transaction {
  tipoOperazione: string
  dataOperazione: Date
  trimestreComp: string
  importoLordoAderente: number
  importoLordoAzienda: number
  tfr: number
  altro: number
  quotaSpese: number
  net: number
}

function parseItalianDate(s: string): Date | null {
  const trimmed = s.replace(/\u00a0/g, '').trim()
  if (!trimmed) return null
  const parts = trimmed.split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return isNaN(date.getTime()) ? null : date
}

export function parseXls(rows: string[][]): Transaction[] {
  const transactions: Transaction[] = []

  for (const cells of rows) {
    if (cells.length < 11) continue

    const text = (i: number) => cells[i] ?? ''

    const dataOperazione = parseItalianDate(text(2))
    if (!dataOperazione) continue

    const importoLordoAderente = parseItalianNumber(text(6))
    const importoLordoAzienda  = parseItalianNumber(text(7))
    const tfr                  = parseItalianNumber(text(8))
    const altro                = parseItalianNumber(text(9))
    const quotaSpese           = parseItalianNumber(text(10))

    const net = importoLordoAderente + importoLordoAzienda + tfr + altro + quotaSpese

    transactions.push({
      tipoOperazione: text(0),
      dataOperazione,
      trimestreComp: text(3),
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
