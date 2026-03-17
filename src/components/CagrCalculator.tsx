import * as React from 'react'
import { parseXls } from '@/lib/parseXls'
import { computeXirr } from '@/lib/xirr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ContributionsChart } from '@/components/ContributionsChart'
import { ForecastChart } from '@/components/ForecastChart'
import { Tooltip } from '@/components/ui/tooltip'

interface Props {
  file: File
}

interface YearRow {
  year: number
  count: number
  aderente: number
  azienda: number
  tfr: number
  fees: number
  net: number
}

interface Results {
  xirr: number
  xirrNoAzienda: number
  totalAderente: number
  totalAzienda: number
  totalTfr: number
  totalFees: number
  firstDate: Date
  lastDate: Date
  years: number
  yearRows: YearRow[]
  transactionCount: number
  currentValue: number
}

const fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const fmtDate = new Intl.DateTimeFormat('it-IT')

function parseItalianInput(s: string): number {
  const cleaned = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? NaN : n
}

export function CagrCalculator({ file }: Props) {
  const [portfolioValue, setPortfolioValue] = React.useState('')
  const [results, setResults] = React.useState<Results | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setResults(null)
    setError(null)
  }, [file])

  function calculate() {
    setError(null)
    setResults(null)
    setLoading(true)

    const currentValue = parseItalianInput(portfolioValue)
    if (isNaN(currentValue) || currentValue <= 0) {
      setError('Inserisci un valore attuale del portafoglio valido (es. 15.000,00).')
      setLoading(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const html = e.target?.result as string
        const transactions = parseXls(html)

        if (transactions.length === 0) {
          throw new Error('Nessuna transazione trovata nel file. Verifica il formato.')
        }

        transactions.sort((a, b) => a.dataOperazione.getTime() - b.dataOperazione.getTime())

        const lastDate = transactions[transactions.length - 1].dataOperazione
        const terminalDate = new Date() > lastDate ? new Date() : lastDate

        // — Standard XIRR: all components as contributions —
        const cashFlows = transactions
          .filter(t => t.net !== 0)
          .map(t => ({ amount: -t.net, date: t.dataOperazione }))
        cashFlows.push({ amount: currentValue, date: terminalDate })
        const rate = computeXirr(cashFlows)

        // — Bonus XIRR: exclude Importo Lordo Azienda from cost basis —
        // Only aderente + tfr + altro + quotaSpese are counted as the investor's cost
        const cashFlowsNoAzienda = transactions
          .filter(t => (t.importoLordoAderente + t.tfr + t.altro + t.quotaSpese) !== 0)
          .map(t => ({
            amount: -(t.importoLordoAderente + t.tfr + t.altro + t.quotaSpese),
            date: t.dataOperazione,
          }))
        cashFlowsNoAzienda.push({ amount: currentValue, date: terminalDate })
        const rateNoAzienda = computeXirr(cashFlowsNoAzienda)

        // — Totals —
        const totalAderente = transactions.reduce((s, t) => s + t.importoLordoAderente, 0)
        const totalAzienda = transactions.reduce((s, t) => s + t.importoLordoAzienda, 0)
        const totalTfr = transactions.reduce((s, t) => s + t.tfr, 0)
        const totalFees = transactions.reduce((s, t) => s + t.quotaSpese, 0)

        // — Group by year —
        const byYear = new Map<number, YearRow>()
        for (const t of transactions) {
          const year = t.dataOperazione.getFullYear()
          const existing = byYear.get(year) ?? {
            year, count: 0, aderente: 0, azienda: 0, tfr: 0, fees: 0, net: 0,
          }
          existing.count += 1
          existing.aderente += t.importoLordoAderente
          existing.azienda += t.importoLordoAzienda
          existing.tfr += t.tfr
          existing.fees += t.quotaSpese
          existing.net += t.net
          byYear.set(year, existing)
        }

        const firstDate = transactions[0].dataOperazione
        const years = (terminalDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

        setResults({
          xirr: rate,
          xirrNoAzienda: rateNoAzienda,
          totalAderente,
          totalAzienda,
          totalTfr,
          totalFees,
          firstDate,
          lastDate: transactions[transactions.length - 1].dataOperazione,
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
    reader.onerror = () => {
      setError('Impossibile leggere il file.')
      setLoading(false)
    }
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Separator />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="portfolio-value"
          className="text-xs tracking-widest uppercase text-[--color-muted-foreground]"
        >
          💼 Valore attuale del portafoglio (€)
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
          <Button onClick={calculate} disabled={loading}>
            {loading ? 'Calcolo…' : 'Calcola Rendimento 📐'}
          </Button>
        </div>
        <p id="portfolio-value-hint" className="text-xs text-[--color-muted-foreground]">
          Usa il formato italiano: punto come separatore migliaia, virgola come decimale.
        </p>
      </div>

      {error && (
        <div className="rounded-[--radius] border border-[--color-border] bg-[--color-muted] px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {results && <ResultsPanel results={results} />}
    </div>
  )
}

function xirrEmoji(r: number) {
  return r >= 0.08 ? '🚀' : r >= 0.04 ? '📈' : r >= 0 ? '📊' : '📉'
}

function ResultsPanel({ results }: { results: Results }) {
  const totalInvested = results.totalAderente + results.totalAzienda + results.totalTfr

  const stats = [
    { emoji: xirrEmoji(results.xirr), label: 'CAGR (XIRR)', value: `${(results.xirr * 100).toFixed(2)}%`, note: 'per anno — tutti i contributi' },
    { emoji: '💰', label: 'Totale versato', value: fmt.format(totalInvested), note: `${results.transactionCount} operazioni` },
    { emoji: '🏦', label: 'Spese totali', value: fmt.format(Math.abs(results.totalFees)), note: 'commissioni e costi' },
    { emoji: '📅', label: 'Durata', value: `${results.years.toFixed(1)} anni`, note: `${fmtDate.format(results.firstDate)} → ${fmtDate.format(results.lastDate)}` },
  ]

  const bonusStats = [
    { emoji: xirrEmoji(results.xirrNoAzienda), label: 'CAGR senza azienda', value: `${(results.xirrNoAzienda * 100).toFixed(2)}%`, note: 'per anno — solo tuo costo' },
    { emoji: '🎁', label: 'Contributo azienda', value: fmt.format(results.totalAzienda), note: 'non contato come tuo costo' },
    { emoji: '👤', label: 'Tuo contributo', value: fmt.format(results.totalAderente), note: 'versamenti aderente' },
    { emoji: '📦', label: 'TFR versato', value: fmt.format(results.totalTfr), note: 'trattamento fine rapporto' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Separator />

      {/* Main results */}
      <div>
        <p className="text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-4">
          Risultati
        </p>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardDescription>{s.emoji} {s.label}</CardDescription>
                <CardTitle className="text-2xl">
                  {s.label === 'CAGR (XIRR)' ? (
                    <Tooltip content="Il CAGR è il tasso di crescita annuo medio del tuo investimento. In pratica ti dice: «se ogni anno il mio fondo fosse cresciuto sempre della stessa percentuale, di quanto sarebbe cresciuto?». Più è alto, meglio ha reso il tuo fondo nel tempo.">
                      <span className="border-b border-dashed border-current cursor-help">{s.value}</span>
                    </Tooltip>
                  ) : s.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[--color-muted-foreground]">{s.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Year breakdown table */}
      <div>
        <p className="text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-4">
          Riepilogo per anno
        </p>
        <div className="rounded-[--radius] border border-[--color-border] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-muted]">
                <th className="px-3 py-2 text-left font-medium text-[--color-muted-foreground]">Anno</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">Op.</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">👤 Aderente</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">🏢 Azienda</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">📦 TFR</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">🏦 Spese</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">Netto</th>
              </tr>
            </thead>
            <tbody>
              {results.yearRows.map((row, i) => (
                <tr
                  key={row.year}
                  className={i % 2 === 0 ? 'bg-[--color-card]' : 'bg-[--color-muted]'}
                >
                  <td className="px-3 py-2 font-medium">📅 {row.year}</td>
                  <td className="px-3 py-2 text-right font-mono text-[--color-muted-foreground]">{row.count}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt.format(row.aderente)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt.format(row.azienda)}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.tfr !== 0 ? fmt.format(row.tfr) : '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-[--color-muted-foreground]">
                    {row.fees !== 0 ? fmt.format(Math.abs(row.fees)) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-medium">{fmt.format(row.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[--color-border] bg-[--color-muted]">
                <td className="px-3 py-2 font-semibold">Totale</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{results.transactionCount}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{fmt.format(results.totalAderente)}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{fmt.format(results.totalAzienda)}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{fmt.format(results.totalTfr)}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{fmt.format(Math.abs(results.totalFees))}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">
                  {fmt.format(totalInvested + results.totalFees)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Separator />

      {/* Contributions chart */}
      <div>
        <p className="text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-4">
          Contributi per anno
        </p>
        <ContributionsChart yearRows={results.yearRows} />
      </div>

      <Separator />

      {/* Forecast chart */}
      <div>
        <p className="text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-4">
          Proiezione futura
        </p>
        <ForecastChart
          currentValue={results.currentValue}
          defaultAderente={results.totalAderente / results.years}
          defaultAzienda={results.totalAzienda / results.years}
          defaultTfr={results.totalTfr / results.years}
        />
      </div>

      <Separator />

      {/* Bonus section */}
      <div>
        <p className="text-xs tracking-widest uppercase text-[--color-muted-foreground] mb-1">
          Bonus
        </p>
        <p className="text-sm text-[--color-muted-foreground] mb-4">
          Questo CAGR esclude il contributo del datore di lavoro dal costo base, perché quel denaro non è mai uscito dal tuo portafoglio:
          nel momento in cui versi la tua quota, l'azienda aggiunge immediatamente la propria — <strong className="text-[--color-foreground]">soldi gratis</strong> che entrano in automatico.
          Il risultato mostra quanto rende il capitale che hai <em>davvero</em> speso di tasca tua.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {bonusStats.map(s => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardDescription>{s.emoji} {s.label}</CardDescription>
                <CardTitle className="text-2xl">{s.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[--color-muted-foreground]">{s.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
