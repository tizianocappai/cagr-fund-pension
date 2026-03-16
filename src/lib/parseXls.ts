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

function parseItalianNumber(s: string): number {
  const cleaned = s
    .replace(/\u00a0/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
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

export function parseXls(content: string): Transaction[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const rows = Array.from(doc.querySelectorAll('tbody tr'))

  const transactions: Transaction[] = []

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td'))
    if (cells.length < 11) continue

    const text = (i: number) =>
      cells[i]?.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''

    const dataOperazione = parseItalianDate(text(2))
    if (!dataOperazione) continue

    const importoLordoAderente = parseItalianNumber(text(6))
    const importoLordoAzienda = parseItalianNumber(text(7))
    const tfr = parseItalianNumber(text(8))
    const altro = parseItalianNumber(text(9))
    const quotaSpese = parseItalianNumber(text(10))

    const net =
      importoLordoAderente +
      importoLordoAzienda +
      tfr +
      altro +
      quotaSpese

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
