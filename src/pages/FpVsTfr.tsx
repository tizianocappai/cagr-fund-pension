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
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import { fmtEurRound, tickY } from '@/lib/formatters'
import { parseEur, parseRate } from '@/lib/parse'

// ── IRPEF 2026 ────────────────────────────────────────────────────────────────

interface IrpefResult {
  tax: number
  effectiveRate: number
  marginalRate: number
  brackets: { label: string; base: number; rate: number; tax: number }[]
}

function calcIrpef(income: number): IrpefResult {
  if (income <= 0) return { tax: 0, effectiveRate: 0, marginalRate: 0.23, brackets: [] }

  const brackets: IrpefResult['brackets'] = []
  let remaining = income
  let tax = 0

  if (remaining > 50_000) {
    const base = remaining - 50_000
    const t = base * 0.43
    brackets.unshift({ label: 'Oltre €50.000', base, rate: 0.43, tax: t })
    tax += t
    remaining = 50_000
  }
  if (remaining > 28_000) {
    const base = remaining - 28_000
    const t = base * 0.33
    brackets.unshift({ label: '€28.001 – €50.000', base, rate: 0.33, tax: t })
    tax += t
    remaining = 28_000
  }
  {
    const base = remaining
    const t = base * 0.23
    brackets.unshift({ label: 'Fino a €28.000', base, rate: 0.23, tax: t })
    tax += t
  }

  const marginalRate = income > 50_000 ? 0.43 : income > 28_000 ? 0.33 : 0.23

  return { tax, effectiveRate: tax / income, marginalRate, brackets }
}

/**
 * TFR tax: Italian "tassazione separata".
 * The effective rate is computed by applying IRPEF to TFR_totale / years
 * (the "base imponibile per anno di servizio"), then treating that rate as flat.
 */
function calcTfrTax(tfrGross: number, years: number): number {
  if (years <= 0 || tfrGross <= 0) return 0
  const annualBase = tfrGross / years
  const { effectiveRate } = calcIrpef(annualBase)
  return tfrGross * effectiveRate
}

/**
 * Pension fund payout tax (tassazione agevolata).
 * Rate = 15% for up to 15 years, then −0.3% per extra year, floor 9% at 35+ years.
 */
function calcFpTaxRate(years: number): number {
  return Math.max(0.09, 0.15 - Math.max(0, years - 15) * 0.003)
}

function calcFpTax(fpGross: number, years: number): number {
  return fpGross * calcFpTaxRate(years)
}

// ── TFR simulation ────────────────────────────────────────────────────────────

interface TfrProps {
  ral: number
  years: number
  inflazione: string
  setInflazione: (v: string) => void
}

const TfrSection = React.memo(function TfrSection({ ral, years, inflazione, setInflazione }: TfrProps) {
  const infRate = parseRate(inflazione)
  const tfrRate = 0.015 + 0.75 * infRate
  const accrual = ral / 13.5

  const data = React.useMemo(() => {
    const points: { anno: number; 'TFR accantonato': number }[] = [{ anno: 0, 'TFR accantonato': 0 }]
    let balance = 0
    for (let y = 1; y <= years; y++) {
      balance = (balance + accrual) * (1 + tfrRate)
      points.push({ anno: y, 'TFR accantonato': Math.round(balance) })
    }
    return points
  }, [accrual, tfrRate, years])

  const finalValue  = data[data.length - 1]['TFR accantonato']
  const yMax        = Math.ceil(finalValue / 10_000) * 10_000 || 10_000
  const rateDisplay = (tfrRate * 100).toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  const infDisplay  = (infRate  * 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const tfrTax     = calcTfrTax(finalValue, years)
  const tfrNetto   = finalValue - tfrTax
  const tfrTaxRate = finalValue > 0 ? tfrTax / finalValue : 0

  return (
    <div className="flex flex-col gap-5">
      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-3 text-sm">
        <p>
          Tasso di rivalutazione TFR applicato:{' '}
          <strong>1,5% + 75% × {infDisplay}% = {rateDisplay}%</strong> annuo
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Accantonamento annuo lordo:{' '}
          <strong className="text-foreground">{fmtEurRound.format(Math.round(accrual))}</strong>{' '}
          (RAL ÷ 13,5)
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tfr-inf" className="text-xs text-muted-foreground">
          Inflazione ISTAT FOI (%)
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

      <div role="img" aria-label="Grafico: crescita del TFR nel tempo">
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
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
          <Line type="monotone" dataKey="TFR accantonato" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-0 border border-border text-sm divide-y divide-border">
        <div className="flex justify-between px-4 py-2">
          <span className="text-muted-foreground">TFR lordo dopo {years} anni</span>
          <span className="font-mono font-medium">{fmtEurRound.format(finalValue)}</span>
        </div>
        <div className="flex justify-between px-4 py-2">
          <span className="text-muted-foreground">
            Tassazione separata stimata ({(tfrTaxRate * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%)
          </span>
          <span className="font-mono text-error">−{fmtEurRound.format(tfrTax)}</span>
        </div>
        <div className="flex justify-between px-4 py-2 bg-muted">
          <span className="font-semibold">TFR netto stimato</span>
          <span className="font-mono font-semibold">{fmtEurRound.format(tfrNetto)}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        La tassazione separata è stimata applicando gli scaglioni IRPEF 2026 alla quota annua (TFR ÷ anni di servizio).
        Il calcolo è indicativo e non tiene conto di detrazioni o addizionali regionali/comunali.
      </p>
    </div>
  )
})

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
  ulterioreContributo: string
  setUlterioreContributo: (v: string) => void
}

const FpSection = React.memo(function FpSection({ ral, years, rendimento, setRendimento, quotaAderente, setQuotaAderente, quotaAzienda, setQuotaAzienda, ulterioreContributo, setUlterioreContributo }: FpProps) {
  const r           = parseRate(rendimento)
  const pctAderente = parseRate(quotaAderente)
  const pctAzienda  = parseRate(quotaAzienda)
  const extraAnnuo  = parseEur(ulterioreContributo)

  const tfrAnnuo   = ral / 13.5
  const aderAnnuo  = ral * pctAderente
  const aziAnnuo   = ral * pctAzienda
  const totalAnnuo = tfrAnnuo + aderAnnuo + aziAnnuo + extraAnnuo

  const data = React.useMemo(() => {
    const points: { anno: number; 'Fondo pensione': number }[] = [{ anno: 0, 'Fondo pensione': 0 }]
    let balance = 0
    for (let y = 1; y <= years; y++) {
      balance = (balance + totalAnnuo) * (1 + r)
      points.push({ anno: y, 'Fondo pensione': Math.round(balance) })
    }
    return points
  }, [totalAnnuo, r, years])

  const finalValue = data[data.length - 1]['Fondo pensione']
  const yMax       = Math.ceil(finalValue / 10_000) * 10_000 || 10_000
  const rDisplay   = (r * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 2 })

  const fpTax      = calcFpTax(finalValue, years)
  const fpNetto    = finalValue - fpTax
  const fpTaxRate  = calcFpTaxRate(years)

  return (
    <div className="flex flex-col gap-5">
      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-3 text-sm">
        <p>Versamento annuo totale: <strong>{fmtEurRound.format(Math.round(totalAnnuo))}</strong></p>
        <p className="mt-1 text-xs text-muted-foreground flex flex-col gap-0.5">
          <span>TFR: {fmtEurRound.format(Math.round(tfrAnnuo))} (RAL ÷ 13,5)</span>
          <span>Aderente: {fmtEurRound.format(Math.round(aderAnnuo))} ({(pctAderente * 100).toLocaleString('it-IT', { maximumFractionDigits: 2 })}% RAL)</span>
          <span>Azienda: {fmtEurRound.format(Math.round(aziAnnuo))} ({(pctAzienda * 100).toLocaleString('it-IT', { maximumFractionDigits: 2 })}% RAL)</span>
          {extraAnnuo > 0 && <span>Ulteriore contributo: {fmtEurRound.format(Math.round(extraAnnuo))}</span>}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Non sai quale rendimento usare? Consulta i rendimenti ufficiali per fondo e comparto sul sito{' '}
        <a href="https://www.covip.it/per-gli-operatori/fondi-pensione/costi-e-rendimenti-dei-fondi-pensione/elenco-dei-rendimenti" target="_blank" rel="noopener noreferrer">
          COVIP — Elenco dei rendimenti
        </a>.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-rendimento" className="text-xs text-muted-foreground">Rendimento annuo (%)</label>
          <Input id="fp-rendimento" value={rendimento} onChange={e => setRendimento(e.target.value)} placeholder="3" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-aderente" className="text-xs text-muted-foreground">Quota aderente (% RAL)</label>
          <Input id="fp-aderente" value={quotaAderente} onChange={e => setQuotaAderente(e.target.value)} placeholder="1,2" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-azienda" className="text-xs text-muted-foreground">Quota azienda (% RAL)</label>
          <Input id="fp-azienda" value={quotaAzienda} onChange={e => setQuotaAzienda(e.target.value)} placeholder="2" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fp-extra" className="text-xs text-muted-foreground">Ulteriore contributo annuale (€)</label>
          <Input id="fp-extra" value={ulterioreContributo} onChange={e => setUlterioreContributo(e.target.value)} placeholder="5.300" className="font-mono" />
        </div>
      </div>

      <div role="img" aria-label="Grafico: crescita del fondo pensione nel tempo">
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
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: 11, color: '#737373', paddingTop: 8 }} />
          <Line type="monotone" dataKey="Fondo pensione" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-0 border border-border text-sm divide-y divide-border">
        <div className="flex justify-between px-4 py-2">
          <span className="text-muted-foreground">Capitale lordo dopo {years} anni (rendimento {rDisplay}%)</span>
          <span className="font-mono font-medium">{fmtEurRound.format(finalValue)}</span>
        </div>
        <div className="flex justify-between px-4 py-2">
          <span className="text-muted-foreground">
            Tassazione agevolata ({(fpTaxRate * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
            {years <= 15 ? ' — max, meno di 15 anni' : years >= 35 ? ' — min, 35+ anni' : ` — 15% − 0,3% × ${years - 15} anni = ${(fpTaxRate * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`})
          </span>
          <span className="font-mono text-error">−{fmtEurRound.format(fpTax)}</span>
        </div>
        <div className="flex justify-between px-4 py-2 bg-muted">
          <span className="font-semibold">Capitale netto stimato</span>
          <span className="font-mono font-semibold">{fmtEurRound.format(fpNetto)}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Tassazione agevolata: 15% fino a 15 anni di adesione, poi −0,3% per ogni anno aggiuntivo, minimo 9% oltre i 35 anni.
        Il calcolo è indicativo e si applica alla prestazione in capitale a scadenza.
      </p>
    </div>
  )
})

// ── Simulation helpers (shared with recap) ────────────────────────────────────

function simulateTfr(ral: number, years: number, infRate: number): number {
  const tfrRate = 0.015 + 0.75 * infRate
  const accrual = ral / 13.5
  let v = 0
  for (let y = 1; y <= years; y++) v = (v + accrual) * (1 + tfrRate)
  return Math.round(v)
}

function simulateFp(ral: number, years: number, r: number, pctAderente: number, pctAzienda: number, extra: number): number {
  const totalAnnuo = ral / 13.5 + ral * pctAderente + ral * pctAzienda + extra
  let v = 0
  for (let y = 1; y <= years; y++) v = (v + totalAnnuo) * (1 + r)
  return Math.round(v)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FpVsTfr() {
  const [ralInput,  setRalInput]  = React.useState('30.000')
  const [anniInput, setAnniInput] = React.useState('30')

  const [inflazione,          setInflazione]          = React.useState('1,1')
  const [rendimento,          setRendimento]          = React.useState('3')
  const [quotaAderente,       setQuotaAderente]       = React.useState('1,2')
  const [quotaAzienda,        setQuotaAzienda]        = React.useState('2')
  const [ulterioreContributo, setUlterioreContributo] = React.useState('')

  const ral   = parseEur(ralInput) || 30_000
  const years = Math.min(Math.max(1, parseInt(anniInput) || 30), 50)

  const extra = parseEur(ulterioreContributo)

  React.useEffect(() => {
    const aderAnnuo = ral * parseRate(quotaAderente)
    const aziAnnuo  = ral * parseRate(quotaAzienda)
    const residuo = Math.max(0, Math.round(5300 - aderAnnuo - aziAnnuo))
    setUlterioreContributo(residuo.toLocaleString('it-IT'))
  }, [ral, quotaAderente, quotaAzienda])

  const tfrFinal = simulateTfr(ral, years, parseRate(inflazione))
  const fpFinal  = simulateFp(ral, years, parseRate(rendimento), parseRate(quotaAderente), parseRate(quotaAzienda), extra)

  const tfrVersato = Math.round((ral / 13.5) * years)
  const fpVersato  = Math.round((ral / 13.5 + ral * parseRate(quotaAderente) + ral * parseRate(quotaAzienda) + extra) * years)

  const irpef         = calcIrpef(ral)
  const tfrNettoFinal = tfrFinal - calcTfrTax(tfrFinal, years)
  const fpNettoFinal  = fpFinal  - calcFpTax(fpFinal, years)

  const diff    = fpNettoFinal - tfrNettoFinal
  const diffPct = tfrNettoFinal > 0 ? (diff / tfrNettoFinal) * 100 : null

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold"><span aria-hidden="true">⚖️</span> FP vs TFR</h1>
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

      <div className="grid grid-cols-2 gap-4 mb-2 max-w-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="ral" className="text-xs tracking-widest uppercase text-muted-foreground">
            RAL di Gennaro (€)
          </label>
          <Input id="ral" value={ralInput} onChange={e => setRalInput(e.target.value)} placeholder="30.000" className="font-mono" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="orizzonte" className="text-xs tracking-widest uppercase text-muted-foreground">
            Anni alla pensione
          </label>
          <Input id="orizzonte" type="number" min={1} max={50} value={anniInput} onChange={e => setAnniInput(e.target.value)} className="font-mono" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Usa il formato italiano per la RAL: punto come separatore migliaia.
      </p>

      {ral > 0 && (
        <div className="border-l-4 border-[#0b0c0c] bg-muted px-4 py-3 text-sm mb-8">
          <p className="font-semibold mb-2">IRPEF 2026 sulla tua RAL</p>
          <div className="flex flex-col gap-1 text-xs">
            {irpef.brackets.map(b => b.base > 0 && (
              <div key={b.label} className="flex justify-between">
                <span className="text-muted-foreground">{b.label} × {(b.rate * 100).toFixed(0)}%</span>
                <span className="font-mono">{fmtEurRound.format(b.tax)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-1 mt-1 font-semibold">
              <span>Totale IRPEF</span>
              <span className="font-mono text-error">{fmtEurRound.format(irpef.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aliquota effettiva</span>
              <span className="font-mono">{(irpef.effectiveRate * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aliquota marginale</span>
              <span className="font-mono">{(irpef.marginalRate * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>RAL netta stimata</span>
              <span className="font-mono">{fmtEurRound.format(ral - irpef.tax)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Stima indicativa — non include detrazioni, addizionali regionali/comunali o altri contributi.</p>
        </div>
      )}

      <Separator className="mb-8" />

      <div>
        <p className="text-base font-bold mb-1 border-l-4 border-[#0b0c0c] pl-3">TFR in azienda</p>
        <p className="text-sm text-muted-foreground mb-5">
          Simulazione della crescita del TFR se resta depositato in azienda. La rivalutazione
          annua è fissata per legge a{' '}
          <strong className="text-foreground">1,5% + 75% dell'inflazione ISTAT FOI</strong>.
        </p>
        <TfrSection ral={ral} years={years} inflazione={inflazione} setInflazione={setInflazione} />
      </div>

      <Separator className="my-8" />

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
          ulterioreContributo={ulterioreContributo}
          setUlterioreContributo={setUlterioreContributo}
        />
      </div>

      <Separator className="my-8" />

      <div>
        <p className="text-base font-bold mb-4 border-l-4 border-[#0b0c0c] pl-3">Riepilogo</p>
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Scenario</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Versato totale</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Capitale lordo</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Capitale netto</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Rendita maturata</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-card">
                <td className="px-3 py-2 font-medium">TFR in azienda</td>
                <td className="px-3 py-2 text-right font-mono">{fmtEurRound.format(tfrVersato)}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmtEurRound.format(tfrFinal)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtEurRound.format(tfrNettoFinal)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtEurRound.format(tfrNettoFinal - tfrVersato)}</td>
              </tr>
              <tr className="bg-muted">
                <td className="px-3 py-2 font-medium">Fondo pensione</td>
                <td className="px-3 py-2 text-right font-mono">{fmtEurRound.format(fpVersato)}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmtEurRound.format(fpFinal)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtEurRound.format(fpNettoFinal)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmtEurRound.format(fpNettoFinal - fpVersato)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted">
                <td className="px-3 py-2 font-semibold" colSpan={3}>Vantaggio fondo pensione (netto)</td>
                <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: diff >= 0 ? '#00703c' : '#d4351c' }}>
                  {diff >= 0 ? '+' : ''}{fmtEurRound.format(diff)}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: diff >= 0 ? '#00703c' : '#d4351c' }}>
                  {diffPct !== null
                    ? `${diff >= 0 ? '+' : ''}${diffPct.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                    : 'N/A'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}
