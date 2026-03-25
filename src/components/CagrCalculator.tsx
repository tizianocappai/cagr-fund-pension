import * as React from 'react'
import { parseXls, type Transaction } from '@/lib/parseXls'
import { readExcel } from '@/lib/readExcel'
import { computeXirr } from '@/lib/xirr'
import { parseItalianInput } from '@/lib/parse'
import { fmtEur } from '@/lib/formatters'
import { Alert, Button, Divider, Input, Tooltip } from 'antd'
import { Card } from 'antd'
import { ContributionsChart } from '@/components/ContributionsChart'
import { ForecastChart, type Flow } from '@/components/ForecastChart'
import { CostAnalysis } from '@/components/CostAnalysis'
import { type ContributionColumn } from '@/lib/providerConfig'

interface Props {
  file: File
  flow: Flow
  columns: ContributionColumn[]
  parser?: (rows: string[][]) => Transaction[]
}

interface YearRow {
  year: number
  count: number
  aderente: number
  azienda: number
  tfr: number
  altro: number
  fees: number
  net: number
}

interface Results {
  xirr: number
  xirrNoAzienda: number
  totalAderente: number
  totalAzienda: number
  totalTfr: number
  totalAltro: number
  totalFees: number
  firstDate: Date
  lastDate: Date
  years: number
  yearRows: YearRow[]
  transactionCount: number
  currentValue: number
}

const fmtDate = new Intl.DateTimeFormat('it-IT')

export function CagrCalculator({ file, flow, columns, parser = parseXls }: Props) {
  const [portfolioValue, setPortfolioValue] = React.useState('')
  const [results, setResults] = React.useState<Results | null>(null)
  const [error, setError]     = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setResults(null)
    setError(null)
  }, [file])

  async function calculate() {
    setError(null)
    setResults(null)

    const currentValue = parseItalianInput(portfolioValue)
    if (isNaN(currentValue) || currentValue <= 0) {
      setError('Inserisci un valore attuale del portafoglio valido (es. 15.000,00).')
      return
    }

    setLoading(true)
    try {
      const rows = await readExcel(file)
      const transactions = parser(rows)

      if (transactions.length === 0) {
        throw new Error('Nessuna transazione trovata nel file. Verifica il formato.')
      }

      transactions.sort((a, b) => a.dataOperazione.getTime() - b.dataOperazione.getTime())

      const firstDate    = transactions[0].dataOperazione
      const lastDate     = transactions[transactions.length - 1].dataOperazione
      const terminalDate = new Date() > lastDate ? new Date() : lastDate
      const years        = (terminalDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

      if (years <= 0) {
        throw new Error('Intervallo temporale troppo breve per calcolare il rendimento.')
      }

      const cashFlows = transactions
        .filter(t => t.net !== 0)
        .map(t => ({ amount: -t.net, date: t.dataOperazione }))
      cashFlows.push({ amount: currentValue, date: terminalDate })
      const rate = computeXirr(cashFlows)

      const cashFlowsNoAzienda = transactions
        .filter(t => (t.importoLordoAderente + t.tfr + t.altro + t.quotaSpese) !== 0)
        .map(t => ({
          amount: -(t.importoLordoAderente + t.tfr + t.altro + t.quotaSpese),
          date: t.dataOperazione,
        }))
      cashFlowsNoAzienda.push({ amount: currentValue, date: terminalDate })
      const rateNoAzienda = computeXirr(cashFlowsNoAzienda)

      const totalAderente = transactions.reduce((s, t) => s + t.importoLordoAderente, 0)
      const totalAzienda  = transactions.reduce((s, t) => s + t.importoLordoAzienda, 0)
      const totalTfr      = transactions.reduce((s, t) => s + t.tfr, 0)
      const totalAltro    = transactions.reduce((s, t) => s + t.altro, 0)
      const totalFees     = transactions.reduce((s, t) => s + t.quotaSpese, 0)

      const byYear = new Map<number, YearRow>()
      for (const t of transactions) {
        const year = t.dataOperazione.getFullYear()
        const row = byYear.get(year) ?? { year, count: 0, aderente: 0, azienda: 0, tfr: 0, altro: 0, fees: 0, net: 0 }
        row.count    += 1
        row.aderente += t.importoLordoAderente
        row.azienda  += t.importoLordoAzienda
        row.tfr      += t.tfr
        row.altro    += t.altro
        row.fees     += t.quotaSpese
        row.net      += t.net
        byYear.set(year, row)
      }

      setResults({
        xirr: rate,
        xirrNoAzienda: rateNoAzienda,
        totalAderente,
        totalAzienda,
        totalTfr,
        totalAltro,
        totalFees,
        firstDate,
        lastDate,
        years,
        yearRows: Array.from(byYear.values()).sort((a, b) => a.year - b.year),
        transactionCount: transactions.length,
        currentValue,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto durante il calcolo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Divider />

      <div className="flex flex-col gap-2 print:hidden">
        <label htmlFor="portfolio-value" className="text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground">
          Valore attuale del portafoglio (€)
        </label>
        <div className="flex gap-3">
          <Input
            id="portfolio-value"
            value={portfolioValue}
            onChange={e => setPortfolioValue(e.target.value)}
            placeholder="es. 15.000,00"
            className="max-w-xs font-mono"
            aria-describedby="portfolio-value-hint"
          />
          <Button type="primary" onClick={calculate} disabled={loading}>
            {loading ? 'Calcolo…' : 'Calcola Rendimento'}
          </Button>
        </div>
        <p id="portfolio-value-hint" className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">
          Usa il formato italiano: punto come separatore migliaia, virgola come decimale.
        </p>
      </div>

      {error && <Alert type="error" showIcon description={error} />}

      {results && <ResultsPanel results={results} flow={flow} columns={columns} />}
    </div>
  )
}

function ResultsPanel({ results, flow, columns }: { results: Results; flow: Flow; columns: ContributionColumn[] }) {
  const totals: Record<ContributionColumn['key'], number> = {
    aderente: results.totalAderente,
    azienda:  results.totalAzienda,
    tfr:      results.totalTfr,
    altro:    results.totalAltro,
  }
  const totalInvested = columns.reduce((s, col) => s + totals[col.key], 0)

  const totalReturn = results.currentValue - totalInvested
  const totalReturnBonus = results.currentValue - (results.totalAderente + results.totalTfr)

  const stats = [
    { label: 'Tasso di crescita medio annuo', value: `${(results.xirr * 100).toFixed(2)}%`,         note: 'per anno — tutti i contributi' },
    { label: 'Totale versato',                value: fmtEur.format(totalInvested),                  note: `${results.transactionCount} operazioni` },
    { label: 'Rendimento totale',             value: `${fmtEur.format(totalReturn)} (${((totalReturn / totalInvested) * 100).toFixed(1)}%)`, note: 'valore attuale − totale versato' },
    { label: 'Spese totali',                  value: `${fmtEur.format(Math.abs(results.totalFees))} (${(Math.abs(results.totalFees) / totalInvested * 100).toFixed(2)}%)`, note: 'commissioni e costi sul totale versato' },
    { label: 'Durata',                        value: `${results.years.toFixed(1)} anni`,             note: `${fmtDate.format(results.firstDate)} → ${fmtDate.format(results.lastDate)}` },
  ]

  const bonusStats = [
    { label: 'Tasso di crescita senza azienda', value: `${(results.xirrNoAzienda * 100).toFixed(2)}%`, note: 'per anno — solo tuo costo' },
    { label: 'Rendimento sul tuo costo',         value: `${fmtEur.format(totalReturnBonus)} (${((totalReturnBonus / (results.totalAderente + results.totalTfr)) * 100).toFixed(1)}%)`, note: 'valore attuale − (tuo contributo + TFR)' },
    { label: 'Contributo azienda',               value: fmtEur.format(results.totalAzienda),           note: 'non contato come tuo costo' },
    { label: 'Tuo contributo',                   value: fmtEur.format(results.totalAderente),          note: 'versamenti aderente' },
    { label: 'TFR versato',                      value: fmtEur.format(results.totalTfr),               note: 'trattamento fine rapporto' },
  ]

  const exportDate = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(new Date())

  return (
    <div className="flex flex-col gap-6">
      <Divider />

      {/* Print header — visible only when printing */}
      <div className="hidden print:flex print:items-center print:gap-3 print:pb-4 print:border-b-2 print:border-outline">
        <img src="/gennaro-logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
        <div>
          <p className="text-[22px] leading-[28px] font-medium leading-tight">Gennaro — Rendimento Fondo Pensione</p>
          <p className="text-[14px] leading-[20px] tracking-[0.25px] text-muted-foreground">Report generato il {exportDate}</p>
        </div>
      </div>

      {/* Export button — hidden when printing */}
      <div className="flex justify-end print:hidden">
        <Button type="default" onClick={() => window.print()}>
          Esporta PDF
        </Button>
      </div>

      {/* Main results */}
      <div>
        <h2 className="text-[22px] leading-[28px] font-medium mb-4">Risultati</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <Card key={s.label}>
              <div className="pb-2">
                <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">{s.label}</p>
                <div className="text-[28px] leading-[36px] font-bold">
                  {s.label === 'Tasso di crescita medio annuo' ? (
                    <Tooltip title="Il tasso di crescita medio annuo misura quanto è cresciuto il tuo investimento ogni anno in media. In pratica ti dice: «se ogni anno il mio fondo fosse cresciuto sempre della stessa percentuale, di quanto sarebbe cresciuto?». Più è alto, meglio ha reso il tuo fondo nel tempo.">
                      <span className="border-b border-dashed border-current cursor-help">{s.value}</span>
                    </Tooltip>
                  ) : s.value}
                </div>
              </div>
              <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">{s.note}</p>
            </Card>
          ))}
        </div>
      </div>

      <Divider />

      {/* Year breakdown table */}
      <div>
        <h2 className="text-[22px] leading-[28px] font-medium mb-4">Riepilogo per anno</h2>
        <div className="border border-outline overflow-x-auto">
          <table className="w-full text-[14px] leading-[20px] tracking-[0.25px]">
            <thead>
              <tr className="border-b border-outline bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Anno</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Op.</th>
                {columns.map(col => (
                  <th key={col.key} className="px-3 py-2 text-right font-medium text-muted-foreground">{col.label}</th>
                ))}
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Spese</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Netto</th>
              </tr>
            </thead>
            <tbody>
              {results.yearRows.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted'}>
                  <td className="px-3 py-2 font-medium">{row.year}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{row.count}</td>
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2 text-right font-mono">
                      {row[col.key] !== 0 ? fmtEur.format(row[col.key]) : '—'}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                    {row.fees !== 0 ? fmtEur.format(Math.abs(row.fees)) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-medium">{fmtEur.format(row.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-outline bg-muted">
                <td className="px-3 py-2 font-semibold">Totale</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{results.transactionCount}</td>
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2 text-right font-mono font-semibold">{fmtEur.format(totals[col.key])}</td>
                ))}
                <td className="px-3 py-2 text-right font-mono font-semibold">{fmtEur.format(Math.abs(results.totalFees))}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">
                  {fmtEur.format(totalInvested + results.totalFees)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Divider />

      {/* Contributions chart */}
      <div>
        <h2 className="text-[22px] leading-[28px] font-medium mb-4">Contributi per anno</h2>
        <ContributionsChart yearRows={results.yearRows} columns={columns} />
      </div>

      <Divider />

      {/* Forecast chart */}
      <div>
        <h2 className="text-[22px] leading-[28px] font-medium mb-4">Proiezione futura</h2>
        {(() => {
          const prevYear = new Date().getFullYear() - 1
          const row = results.yearRows.find(r => r.year === prevYear) ?? results.yearRows[results.yearRows.length - 1]
          return (
            <ForecastChart
              flow={flow}
              defaultAderente={row.aderente}
              defaultAzienda={row.azienda}
              defaultTfr={row.tfr}
              defaultRate={results.xirr}
            />
          )
        })()}
      </div>

      <Divider />

      {/* Bonus section */}
      <div>
        <h2 className="text-[22px] leading-[28px] font-medium mb-1">Bonus</h2>
        <p className="text-[14px] leading-[20px] tracking-[0.25px] text-muted-foreground mb-4">
          Questo tasso di crescita medio annuo esclude il contributo del datore di lavoro dal costo base, perché quel denaro non è mai uscito dal tuo portafoglio:
          nel momento in cui versi la tua quota, l'azienda aggiunge immediatamente la propria — <strong className="text-foreground">soldi gratis</strong> che entrano in automatico.
          Il risultato mostra quanto rende il capitale che hai <em>davvero</em> speso di tasca tua.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {bonusStats.map(s => (
            <Card key={s.label}>
              <div className="pb-2">
                <p className="text-[14px] leading-[20px] tracking-[0.25px] text-on-surface-variant">{s.label}</p>
                <div className="text-[28px] leading-[36px] font-bold">{s.value}</div>
              </div>
              <p className="text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">{s.note}</p>
            </Card>
          ))}
        </div>
      </div>

      <Divider />

      {/* Cost analysis section */}
      <section>
        <h2 className="text-[24px] leading-[32px] font-normal mb-4">
          Analisi costi
        </h2>
        <CostAnalysis results={results} flow={flow} />
      </section>
    </div>
  )
}
