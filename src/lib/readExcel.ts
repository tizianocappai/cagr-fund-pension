import * as XLSX from 'xlsx'

/**
 * Reads an .xls (HTML-disguised) or .xlsx file and returns rows as string[][].
 * Each inner array is one row; each element is the cell value as a string.
 */
export async function readExcel(file: File): Promise<string[][]> {
  if (file.name.endsWith('.xlsx')) {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    // raw: true → numbers come back as JS numbers (e.g. 55.53), avoiding locale-specific formatting
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' })
    return (raw as unknown[][]).map(row =>
      row.map(cell => (typeof cell === 'number' ? cell.toString() : String(cell ?? '')))
    )
  }

  // .xls from Italian portals is actually an HTML table
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const html = e.target?.result as string
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const rows = Array.from(doc.querySelectorAll('tbody tr'))
      const result = rows.map(row =>
        Array.from(row.querySelectorAll('td')).map(
          td => td.textContent?.replace(/\u00a0/g, ' ').trim() ?? ''
        )
      )
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}
