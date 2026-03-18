import * as React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const fmtTick = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 })
const fmtTickDec = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function tickY(v: number) {
  if (v >= 1_000_000) return `€${fmtTickDec.format(v / 1_000_000)}M`
  if (v >= 1_000)     return `€${fmtTick.format(v / 1_000)}k`
  return `€${fmtTick.format(v)}`
}

function parseEur(s: string): number {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n
}

function parsePercent(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n / 100
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs shadow-sm min-w-44">
      <p className="font-semibold mb-1.5">Anno {label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex justify-between gap-4" style={{ color: p.stroke }}>
          <span>{p.name}</span>
          <span className="font-mono">{fmt.format(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

// ── TFR simulation ────────────────────────────────────────────────────────────

interface TfrProps {
  ral: number
  years: number
  inflazione: string
  setInflazione: (v: string) => void
}

function TfrSection({ ral, years, inflazione, setInflazione }: TfrProps) {
  const infRate = parsePercent(inflazione)
  const tfrRate = 0.015 + 0.75 * infRate
  const accrual = ral / 13.5

  const data: { anno: number; '📦 TFR accantonato': number }[] = [{ anno: 0, '📦 TFR accantonato': 0 }]
  let balance = 0
  for (let y = 1; y <= years; y++) {
    balance = (balance + accrual) * (1 + tfrRate)
    data.push({ anno: y, '📦 TFR accantonato': Math.round(balance) })
  }

  const finalValue = data[data.length - 1]['📦 TFR accantonato']
  const yMax = Math.ceil(finalValue / 10_000) * 10_000 || 10_000
  const rateDisplay = (tfrRate * 100).toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  const infDisplay  = (infRate  * 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col gap-5">
      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-3 text-sm">
        <p>
          Tasso di rivalutazione TFR applicato:{' '}
          <strong>1,5% + 75% × {infDisplay}% = {rateDisplay}%</strong> annuo
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accantonamento annuo lordo:{' '}
          <strong className="text-foreground">{fmt.format(Math.round(accrual))}</strong>{' '}
          (RAL ÷ 13,5)
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tfr-inf" className="text-xs text-muted-foreground">
          📊 Inflazione ISTAT FOI (%)
        </label>
        <Input
          id="tfr-inf"
          value={inflazione}
          onChange={e => setInflazione(e.target.value)}
          placeholder="1,1"
          className="font-mono max-w-xs"
        />
        <p className="text-xs text-muted-foreground">Valore FOI ISTAT dicembre 2024: ~1,1%</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 2" />
          <XAxis
            dataKey="anno"
            tickFormatter={v => v === 0 ? 'Oggi' : `+${v}y`}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={tickY}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
            width={62}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
          <Line type="monotone" dataKey="📦 TFR accantonato" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="border border-border px-4 py-3 text-sm">
        Dopo <strong>{years} anni</strong> con RAL {fmt.format(ral)} e inflazione {infDisplay}%,
        il TFR accumulato in azienda sarà circa <strong>{fmt.format(finalValue)}</strong>.
      </div>
    </div>
  )
}

// ── FP simulation ─────────────────────────────────────────────────────────────

interface FpProps {
  ral: number
  years: number
  rendimento: string
  setRendimento: (v: string) => void
  quotaAderente: string
  setQuotaAderente: (v: string) => void
  quotaAzienda: string
  setQuotaAzienda: (v: string) => void
}

function FpSection({ ral, years, rendimento, setRendimento, quotaAderente, setQuotaAderente, quotaAzienda, setQuotaAzienda }: FpProps) {
  const r           = parsePercent(rendimento)
  const pctAderente = parsePercent(quotaAderente)
  const pctAzienda  = parsePercent(quotaAzienda)

  const tfrAnnuo  = ral / 13.5
  const aderAnnuo = ral * pctAderente
  const aziAnnuo  = ral * pctAzienda
  const totalAnnuo = tfrAnnuo + aderAnnuo + aziAnnuo

  const data: { anno: number; '🏦 Fondo pensione': number }[] = [{ anno: 0, '🏦 Fondo pensione': 0 }]
  let balance = 0
  for (let y = 1; y <= years; y++) {
    balance = (balance + totalAnnuo) * (1 + r)
    data.push({ anno: y, '🏦 Fondo pensione': Math.round(balance) })
  }

  const finalValue = data[data.length - 1]['🏦 Fondo pensione']
  const yMax = Math.ceil(finalValue / 10_000) * 10_000 || 10_000
  const rDisplay = (r * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col gap-5">
      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-3 text-sm">
        <p>Versamento annuo totale: <strong>{fmt.format(Math.round(totalAnnuo))}</strong></p>
        <p className="mt-1 text-xs text-muted-foreground flex flex-col gap-0.5">
          <span>📦 TFR: {fmt.format(Math.round(tfrAnnuo))} (RAL ÷ 13,5)</span>
          <span>👤 Aderente: {fmt.format(Math.round(aderAnnuo))} ({(pctAderente * 100).toLocaleString('it-IT', { maximumFractionDigits: 2 })}% RAL)</span>
          <span>🏢 Azienda: {fmt.format(Math.round(aziAnnuo))} ({(pctAzienda * 100).toLocaleString('it-IT', { maximumFractionDigits: 2 })}% RAL)</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-rendimento" className="text-xs text-muted-foreground">📈 Rendimento annuo (%)</label>
          <Input id="fp-rendimento" value={rendimento} onChange={e => setRendimento(e.target.value)} placeholder="3" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-aderente" className="text-xs text-muted-foreground">👤 Quota aderente (% RAL)</label>
          <Input id="fp-aderente" value={quotaAderente} onChange={e => setQuotaAderente(e.target.value)} placeholder="1,2" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-azienda" className="text-xs text-muted-foreground">🏢 Quota azienda (% RAL)</label>
          <Input id="fp-azienda" value={quotaAzienda} onChange={e => setQuotaAzienda(e.target.value)} placeholder="2" className="font-mono" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 2" />
          <XAxis
            dataKey="anno"
            tickFormatter={v => v === 0 ? 'Oggi' : `+${v}y`}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={tickY}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
            width={62}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
          <Line type="monotone" dataKey="🏦 Fondo pensione" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="border border-border px-4 py-3 text-sm">
        Dopo <strong>{years} anni</strong> con RAL {fmt.format(ral)} e rendimento {rDisplay}%,
        il capitale accumulato nel fondo pensione sarà circa <strong>{fmt.format(finalValue)}</strong>.
      </div>
    </div>
  )
}

// ── Helpers shared by recap ───────────────────────────────────────────────────

function simulateTfr(ral: number, years: number, infRate: number): number {
  const tfrRate = 0.015 + 0.75 * infRate
  const accrual = ral / 13.5
  let v = 0
  for (let y = 1; y <= years; y++) v = (v + accrual) * (1 + tfrRate)
  return Math.round(v)
}

function simulateFp(ral: number, years: number, r: number, pctAderente: number, pctAzienda: number): number {
  const totalAnnuo = ral / 13.5 + ral * pctAderente + ral * pctAzienda
  let v = 0
  for (let y = 1; y <= years; y++) v = (v + totalAnnuo) * (1 + r)
  return Math.round(v)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FpVsTfr() {
  const [ralInput,  setRalInput]  = React.useState('30.000')
  const [anniInput, setAnniInput] = React.useState('30')

  // TFR params
  const [inflazione, setInflazione] = React.useState('1,1')

  // FP params
  const [rendimento,    setRendimento]    = React.useState('3')
  const [quotaAderente, setQuotaAderente] = React.useState('1,2')
  const [quotaAzienda,  setQuotaAzienda]  = React.useState('2')

  const ral   = parseEur(ralInput) || 30_000
  const years = Math.min(Math.max(1, parseInt(anniInput) || 30), 50)

  // Recap values
  const tfrFinal = simulateTfr(ral, years, parsePercent(inflazione))
  const fpFinal  = simulateFp(ral, years, parsePercent(rendimento), parsePercent(quotaAderente), parsePercent(quotaAzienda))

  const tfrVersato = Math.round((ral / 13.5) * years)
  const fpVersato  = Math.round((ral / 13.5 + ral * parsePercent(quotaAderente) + ral * parsePercent(quotaAzienda)) * years)

  const diff    = fpFinal - tfrFinal
  const diffPct = tfrFinal > 0 ? ((diff / tfrFinal) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold">⚖️ FP vs TFR</h1>
        <p className="mt-2 text-muted-foreground">
          Confronta cosa succede al tuo TFR se rimane in azienda oppure viene versato nel fondo pensione.
        </p>
      </header>

      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-4 text-sm leading-relaxed mb-8">
        <p>
          In questa pagina simuleremo due scenari. Nel primo, <strong>Gennaro decide di non avere a
          che fare con lo sbattimento di aprire un fondo pensione</strong> e decide di tenere tutto
          in azienda — il suo TFR viene accantonato e rivalutato ogni anno secondo la formula di
          legge. Nel secondo scenario invece <strong>Gennaro decide di aderire al fondo pensione</strong>,
          aggiungendo anche una quota volontaria: il TFR, la quota aderente e la quota azienda
          vengono investiti insieme e crescono al rendimento annuo del fondo.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* RAL + Orizzonte */}
      <div className="grid grid-cols-2 gap-4 mb-2 max-w-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="ral" className="text-xs tracking-widest uppercase text-muted-foreground">
            💼 RAL di Gennaro (€)
          </label>
          <Input id="ral" value={ralInput} onChange={e => setRalInput(e.target.value)} placeholder="30.000" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="orizzonte" className="text-xs tracking-widest uppercase text-muted-foreground">
            ⏳ Anni alla pensione
          </label>
          <Input id="orizzonte" type="number" min={1} max={50} value={anniInput} onChange={e => setAnniInput(e.target.value)} className="font-mono" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-8">
        Usa il formato italiano per la RAL: punto come separatore migliaia.
      </p>

      <Separator className="mb-8" />

      {/* TFR section */}
      <div>
        <p className="text-base font-bold mb-1 border-l-4 border-[#0b0c0c] pl-3">TFR in azienda</p>
        <p className="text-sm text-muted-foreground mb-5">
          Simulazione della crescita del TFR se resta depositato in azienda. La rivalutazione
          annua è fissata per legge a{' '}
          <strong className="text-foreground">1,5% + 75% dell'inflazione ISTAT FOI</strong>.
        </p>
        <TfrSection
          ral={ral}
          years={years}
          inflazione={inflazione}
          setInflazione={setInflazione}
        />
      </div>

      <Separator className="my-8" />

      {/* FP section */}
      <div>
        <p className="text-base font-bold mb-1 border-l-4 border-[#0b0c0c] pl-3">Fondo pensione</p>
        <p className="text-sm text-muted-foreground mb-5">
          Simulazione della crescita del capitale versato nel fondo pensione, applicando
          il rendimento annuo atteso all'intera somma (TFR + quota aderente + quota azienda).
        </p>
        <FpSection
          ral={ral}
          years={years}
          rendimento={rendimento}
          setRendimento={setRendimento}
          quotaAderente={quotaAderente}
          setQuotaAderente={setQuotaAderente}
          quotaAzienda={quotaAzienda}
          setQuotaAzienda={setQuotaAzienda}
        />
      </div>

      <Separator className="my-8" />

      {/* Recap */}
      <div>
        <p className="text-base font-bold mb-4 border-l-4 border-[#0b0c0c] pl-3">Riepilogo</p>
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Scenario</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Versato totale</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Capitale finale</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Rendita maturata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-card">
                <td className="px-3 py-2 font-medium">📦 TFR in azienda</td>
                <td className="px-3 py-2 text-right font-mono">{fmt.format(tfrVersato)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt.format(tfrFinal)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt.format(tfrFinal - tfrVersato)}</td>
              </tr>
              <tr className="bg-muted">
                <td className="px-3 py-2 font-medium">🏦 Fondo pensione</td>
                <td className="px-3 py-2 text-right font-mono">{fmt.format(fpVersato)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt.format(fpFinal)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt.format(fpFinal - fpVersato)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted">
                <td className="px-3 py-2 font-semibold" colSpan={2}>Vantaggio fondo pensione</td>
                <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: diff >= 0 ? '#00703c' : '#d4351c' }}>
                  {diff >= 0 ? '+' : ''}{fmt.format(diff)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: diff >= 0 ? '#00703c' : '#d4351c' }}>
                  {diff >= 0 ? '+' : ''}{diffPct.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}
