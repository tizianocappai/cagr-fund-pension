import * as React from 'react'
import { useMeta } from '@/lib/useMeta'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { fmtEurRound, tickY } from '@/lib/formatters'
import { parseEur } from '@/lib/parse'

// ── Dati storici 2010-2024 ─────────────────────────────────────────────────────
// Fonte: dati storici indicativi basati su MSCI World Net Return EUR e Bloomberg
// Euro Aggregate Government Bond Index. I rendimenti passati non garantiscono
// risultati futuri. Dati al netto delle commissioni ETF (TER).

const YEARS = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] as const

// IE00B4L5Y983 — iShares Core MSCI World UCITS ETF USD Acc (IWDA.AS)
// Rendimenti annuali calcolati su NAV rettificato — fonte: Yahoo Finance (IWDA.AS)
const R_EQUITY: number[] = [
   0.1826, -0.0276,  0.1184,  0.2281,  0.2041,
   0.1032,  0.1087,  0.0749, -0.0416,  0.2958,
   0.0620,  0.3254, -0.1354,  0.1989,  0.2723,
]

// IE00B4WXJJ64 — iShares Core € Govt Bond UCITS ETF EUR Dist (IEAG.AS)
// Rendimenti annuali calcolati su NAV rettificato — fonte: Yahoo Finance (IEAG.AS)
const R_BONDS: number[] = [
  -0.0041, -0.0006,  0.0800,  0.0062,  0.1122,
   0.0160,  0.0325,  0.0038,  0.0027,  0.0577,
   0.0381, -0.0303, -0.1713,  0.0695,  0.0253,
]

// ── Profili di allocazione ────────────────────────────────────────────────────

interface Profile {
  id: string
  label: string
  equityPct: number
  bondsPct: number
  rischioLabel: string
  rischioColor: string
  descrizione: string
}

const PROFILES: Profile[] = [
  {
    id: 'conservativo',
    label: 'Conservativo',
    equityPct: 0.10,
    bondsPct: 0.90,
    rischioLabel: 'Rischio basso',
    rischioColor: '#00703c',
    descrizione: '10% azionario globale, 90% obbligazionario governativo euro. Equivalente al comparto "garantito" o "obbligazionario" di un fondo pensione.',
  },
  {
    id: 'moderato',
    label: 'Moderato',
    equityPct: 0.30,
    bondsPct: 0.70,
    rischioLabel: 'Rischio medio-basso',
    rischioColor: '#f59e0b',
    descrizione: '30% azionario globale, 70% obbligazionario governativo euro. Equivalente al comparto "bilanciato prudente" o "obbligazionario misto".',
  },
  {
    id: 'bilanciato',
    label: 'Bilanciato',
    equityPct: 0.60,
    bondsPct: 0.40,
    rischioLabel: 'Rischio medio-alto',
    rischioColor: '#f97316',
    descrizione: '60% azionario globale, 40% obbligazionario governativo euro. Equivalente al comparto "bilanciato" di un fondo pensione.',
  },
  {
    id: 'dinamico',
    label: 'Dinamico',
    equityPct: 0.85,
    bondsPct: 0.15,
    rischioLabel: 'Rischio alto',
    rischioColor: '#d4351c',
    descrizione: '85% azionario globale, 15% obbligazionario governativo euro. Equivalente al comparto "azionario" o "crescita" di un fondo pensione.',
  },
]

// ── Calcoli ───────────────────────────────────────────────────────────────────

function blended(eqPct: number, bndPct: number): number[] {
  return R_EQUITY.map((re, i) => eqPct * re + bndPct * R_BONDS[i])
}

function geometricCAGR(returns: number[]): number {
  const cum = returns.reduce((acc, r) => acc * (1 + r), 1)
  return Math.pow(cum, 1 / returns.length) - 1
}

function arithmeticMean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stdDev(values: number[]): number {
  const m = arithmeticMean(values)
  return Math.sqrt(values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length)
}

function simulatePac(
  annualContrib: number,
  annualRate: number,
  years: number,
  startYear: number,
): { year: number; capitale: number }[] {
  let balance = 0
  return Array.from({ length: years }, (_, i) => {
    balance = (balance + annualContrib) * (1 + annualRate)
    return { year: startYear + i, capitale: Math.max(0, balance) }
  })
}

// ── Custom tooltip rendimenti ─────────────────────────────────────────────────

function RendimentiTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div className="border border-border bg-white px-3 py-2 text-xs shadow-sm min-w-36">
      <p className="font-semibold mb-1">{label}</p>
      <p className={v >= 0 ? 'text-primary font-mono' : 'text-error font-mono'}>
        {v >= 0 ? '+' : ''}{(v * 100).toFixed(1)}%
      </p>
    </div>
  )
}

// ── Custom tooltip scenari ────────────────────────────────────────────────────

function ScenariTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; stroke: string }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-white px-3 py-2 text-xs shadow-sm min-w-44">
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex justify-between gap-4" style={{ color: p.stroke }}>
          <span>{p.name}</span>
          <span className="font-mono">{fmtEurRound.format(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function Alternative() {
  useMeta(
    'ETF come alternativa al fondo pensione complementare',
    'Replica i comparti del fondo pensione con due ETF a basso costo: iShares Core MSCI World (IE00B4L5Y983) e iShares Core Euro Govt Bond (IE00B4WXJJ64). Dati storici reali e scenari futuri.',
  )
  const [selectedId, setSelectedId] = React.useState('bilanciato')
  const [contributoInput, setContributoInput] = React.useState('200')
  const [orizzonteInput, setOrizzonteInput] = React.useState('30')

  const profile = PROFILES.find(p => p.id === selectedId) ?? PROFILES[2]
  const returns = blended(profile.equityPct, profile.bondsPct)

  const cagrValue   = geometricCAGR(returns)
  const meanReturn  = arithmeticMean(returns)
  const sigmaReturn = stdDev(returns)
  const bestYear    = Math.max(...returns)
  const worstYear   = Math.min(...returns)
  const positiveYears = returns.filter(r => r > 0).length

  const annualBar = YEARS.map((y, i) => ({ year: y, rendimento: returns[i] }))

  const contributo = parseEur(contributoInput) * 12  // mensile → annuale
  const orizzonte  = Math.max(1, Math.min(50, parseInt(orizzonteInput) || 30))
  const startYear  = new Date().getFullYear()

  const rPessimista = Math.max(-0.20, meanReturn - sigmaReturn)
  const rMediano    = cagrValue
  const rOttimista  = meanReturn + sigmaReturn

  const scenariData = React.useMemo(() => {
    const p = simulatePac(contributo, rPessimista, orizzonte, startYear)
    const m = simulatePac(contributo, rMediano, orizzonte, startYear)
    const o = simulatePac(contributo, rOttimista, orizzonte, startYear)
    return m.map((row, i) => ({
      year: row.year,
      pessimista: p[i].capitale,
      mediano: row.capitale,
      ottimista: o[i].capitale,
    }))
  }, [contributo, rPessimista, rMediano, rOttimista, orizzonte, startYear])

  const versatoTotale = contributo * orizzonte

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold">E se facessi da solo con gli ETF?</h1>
        <p className="mt-2 text-muted-foreground">
          Un'alternativa al fondo pensione per chi vuole gestire autonomamente i propri investimenti.
        </p>
      </header>

      {/* Intro */}
      <div className="flex flex-col gap-4 mb-8 text-sm leading-relaxed">
        <p>
          Il fondo pensione ha vantaggi fiscali difficili da battere: deducibilità dei contributi,
          tassazione agevolata al momento del riscatto, contributo del datore di lavoro. Se puoi
          averlo, conviene quasi sempre.
        </p>
        <p>
          Esistono però situazioni in cui il fondo pensione non è accessibile o non è la scelta
          giusta: lavoratori autonomi senza contributo aziendale, chi vuole una maggiore liquidità,
          chi preferisce non vincolare il capitale fino alla pensione. In questi casi, costruire un
          portafoglio ETF con la stessa logica di allocazione dei comparti pensionistici è una
          strategia solida.
        </p>
        <p>
          L'idea è semplice: usare due soli ETF — uno azionario globale e uno obbligazionario
          governativo — nelle stesse proporzioni dei comparti, e investire regolarmente tramite
          un piano di accumulo (PAC).
        </p>
      </div>

      <div className="border-l-4 border-[#f59e0b] bg-[#fef9ec] px-4 py-3 text-sm mb-4">
        <p className="font-semibold mb-1">Questo non è un consiglio di investimento</p>
        <p className="text-muted-foreground">
          I rendimenti storici non garantiscono rendimenti futuri. I dati mostrati sono indicativi
          e basati su indici di riferimento. Prima di investire, valuta la tua situazione personale.
        </p>
      </div>

      {/* Callout tassazione */}
      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-4 text-sm mb-8">
        <p className="font-semibold mb-2">Gli ETF hanno una fiscalità completamente diversa</p>
        <p className="text-muted-foreground mb-3">
          Investire in ETF non dà diritto ad alcuna delle agevolazioni fiscali previste per i fondi
          pensione o per il TFR. Prima di scegliere questa strada, è fondamentale conoscere le
          differenze.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1.5 pr-4 font-semibold text-[#0b0c0c] w-2/5">Aspetto fiscale</th>
                <th className="text-left py-1.5 pr-4 font-semibold text-[#0b0c0c]">ETF (fai da te)</th>
                <th className="text-left py-1.5 font-semibold text-[#0b0c0c]">Fondo pensione</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-t border-[#c5d9ec]">
                <td className="py-1.5 pr-4 font-medium text-[#0b0c0c]">Deducibilità contributi</td>
                <td className="py-1.5 pr-4">Nessuna — versamenti a carico tuo al 100%, senza sgravi IRPEF</td>
                <td className="py-1.5">Deducibili fino a 5.164,57 € / anno dall'imponibile IRPEF</td>
              </tr>
              <tr className="border-t border-[#c5d9ec]">
                <td className="py-1.5 pr-4 font-medium text-[#0b0c0c]">Tassazione rendimenti</td>
                <td className="py-1.5 pr-4">26% su plusvalenze e dividendi (imposta sostitutiva)</td>
                <td className="py-1.5">20% sui rendimenti maturati annualmente (imposta sostitutiva ridotta)</td>
              </tr>
              <tr className="border-t border-[#c5d9ec]">
                <td className="py-1.5 pr-4 font-medium text-[#0b0c0c]">Tassazione in uscita</td>
                <td className="py-1.5 pr-4">26% sulle plusvalenze al momento della vendita</td>
                <td className="py-1.5">9–15% sul capitale accumulato, con aliquota che scende negli anni</td>
              </tr>
              <tr className="border-t border-[#c5d9ec]">
                <td className="py-1.5 pr-4 font-medium text-[#0b0c0c]">TFR</td>
                <td className="py-1.5 pr-4">Non applicabile — il TFR non può essere destinato a ETF</td>
                <td className="py-1.5">Il TFR può essere destinato al fondo pensione con vantaggi fiscali</td>
              </tr>
              <tr className="border-t border-[#c5d9ec]">
                <td className="py-1.5 pr-4 font-medium text-[#0b0c0c]">Contributo datore di lavoro</td>
                <td className="py-1.5 pr-4">Non previsto — nessun apporto aggiuntivo del datore</td>
                <td className="py-1.5">Il datore può versare una quota aggiuntiva, spesso obbligatoria</td>
              </tr>
              <tr className="border-t border-[#c5d9ec]">
                <td className="py-1.5 pr-4 font-medium text-[#0b0c0c]">Liquidità</td>
                <td className="py-1.5 pr-4">Piena — puoi vendere in qualsiasi momento</td>
                <td className="py-1.5">Vincolata — riscatto anticipato consentito solo in casi specifici</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* I due ETF */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-1">I due mattoni</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Due ETF a basso costo quotati su Borsa Italiana, disponibili su tutti i principali broker.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ETF azionario */}
          <div className="border border-border">
            <div className="bg-[#f3f2f1] border-b border-border px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Azionario globale</span>
              <span className="text-xs font-semibold px-2 py-0.5 border" style={{ color: '#d4351c', borderColor: '#d4351c' }}>
                Rischio alto
              </span>
            </div>
            <div className="px-4 py-4 flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Nome</p>
                <p className="font-semibold">iShares Core MSCI World UCITS ETF</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">ISIN</p>
                <p className="font-mono">IE00B4L5Y983</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">TER</p>
                  <p className="font-mono">0,20% / anno</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Struttura</p>
                  <p>Accumulazione</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Replica</p>
                <p>MSCI World — ~1.400 aziende in 23 paesi sviluppati</p>
              </div>
            </div>
          </div>

          {/* ETF obbligazionario */}
          <div className="border border-border">
            <div className="bg-[#f3f2f1] border-b border-border px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Obbligazionario governativo</span>
              <span className="text-xs font-semibold px-2 py-0.5 border" style={{ color: '#00703c', borderColor: '#00703c' }}>
                Rischio basso
              </span>
            </div>
            <div className="px-4 py-4 flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Nome</p>
                <p className="font-semibold">iShares Core € Govt Bond UCITS ETF</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">ISIN</p>
                <p className="font-mono">IE00B4WXJJ64</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">TER</p>
                  <p className="font-mono">0,07% / anno</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Struttura</p>
                  <p>Distribuzione</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Replica</p>
                <p>Bloomberg Euro Aggregate Government — titoli di stato area euro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* Selettore profilo */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-1">Scegli il profilo di rischio</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Stesse allocazioni dei comparti di un fondo pensione, replicate con i due ETF.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {PROFILES.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={[
                'border-2 px-3 py-2.5 text-sm font-semibold text-left transition-colors',
                'focus-visible:outline-3 focus-visible:outline-[#ffdd00]',
                selectedId === p.id
                  ? 'border-[#0b0c0c] bg-[#0b0c0c] text-white'
                  : 'border-border bg-white text-[#0b0c0c] hover:border-[#0b0c0c]',
              ].join(' ')}
            >
              <span className="block">{p.label}</span>
              <span className="block text-xs font-normal mt-0.5" style={{
                color: selectedId === p.id ? '#b1b4b6' : p.rischioColor,
              }}>
                {p.rischioLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Dettaglio profilo selezionato */}
        <div className="border border-border">
          <div
            className="border-b border-border px-4 py-3 flex items-center justify-between"
            style={{ borderLeftWidth: 4, borderLeftColor: profile.rischioColor }}
          >
            <span className="font-bold">{profile.label}</span>
            <span className="text-xs font-semibold px-2 py-0.5 border" style={{
              color: profile.rischioColor,
              borderColor: profile.rischioColor,
            }}>
              {profile.rischioLabel}
            </span>
          </div>
          <div className="px-4 py-4 flex flex-col gap-4">
            <p className="text-sm leading-relaxed">{profile.descrizione}</p>

            {/* Allocazione */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Allocazione</p>
              <div className="flex gap-1 h-6 mb-2">
                <div
                  className="flex items-center justify-center text-xs font-semibold text-white"
                  style={{ width: `${profile.equityPct * 100}%`, backgroundColor: '#d4351c' }}
                >
                  {(profile.equityPct * 100).toFixed(0)}%
                </div>
                <div
                  className="flex items-center justify-center text-xs font-semibold"
                  style={{ width: `${profile.bondsPct * 100}%`, backgroundColor: '#b1b4b6' }}
                >
                  {(profile.bondsPct * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5" style={{ backgroundColor: '#d4351c' }} />
                  IE00B4L5Y983 — azionario
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5" style={{ backgroundColor: '#b1b4b6' }} />
                  IE00B4WXJJ64 — obbligazionario
                </span>
              </div>
            </div>

            {/* Stats storiche */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Statistiche storiche 2010–2024</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="border border-border px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-0.5">CAGR storico</p>
                  <p className="font-mono font-bold text-lg">{(cagrValue * 100).toFixed(1)}%</p>
                </div>
                <div className="border border-border px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-0.5">Miglior anno</p>
                  <p className="font-mono font-bold text-lg text-primary">+{(bestYear * 100).toFixed(1)}%</p>
                </div>
                <div className="border border-border px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-0.5">Peggior anno</p>
                  <p className="font-mono font-bold text-lg text-error">{(worstYear * 100).toFixed(1)}%</p>
                </div>
                <div className="border border-border px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-0.5">Anni positivi</p>
                  <p className="font-mono font-bold text-lg">{positiveYears}/{YEARS.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grafico rendimenti annuali */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-1">Rendimenti anno per anno</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Rendimento annuale del portafoglio blended per il profilo selezionato, 2010–2024.
        </p>

        <div className="border border-border p-4">
          <ResponsiveContainer width="100%" height={240} aria-label="Grafico rendimenti annuali">
            <BarChart data={annualBar} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <ReferenceLine y={0} stroke="#0b0c0c" strokeWidth={1} />
              <Tooltip content={<RendimentiTooltip />} />
              <Bar dataKey="rendimento" radius={0} maxBarSize={32}>
                {annualBar.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rendimento >= 0 ? '#00703c' : '#d4351c'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* Simulatore scenari */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-1">Scenari futuri</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Proiezione del capitale accumulato con un PAC mensile, basata su tre scenari di rendimento
          derivati dalla volatilità storica del profilo selezionato.
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="alt-contributo" className="block text-sm font-semibold mb-1">
              Versamento mensile (€)
            </label>
            <Input
              id="alt-contributo"
              value={contributoInput}
              onChange={e => setContributoInput(e.target.value)}
              inputMode="decimal"
              placeholder="200"
            />
          </div>
          <div>
            <label htmlFor="alt-orizzonte" className="block text-sm font-semibold mb-1">
              Orizzonte temporale (anni)
            </label>
            <Input
              id="alt-orizzonte"
              value={orizzonteInput}
              onChange={e => setOrizzonteInput(e.target.value)}
              inputMode="decimal"
              placeholder="30"
            />
          </div>
        </div>

        {/* Tabella scenari */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Ipotesi di rendimento per scenario
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-2.5 text-left font-semibold">Scenario</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Rendimento annuo ipotetico</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Capitale dopo {orizzonte} anni</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Di cui versato</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-error">Pessimista</span>
                    <span className="text-xs text-muted-foreground block">Media storica − 1 deviazione standard</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {rPessimista >= 0 ? '+' : ''}{(rPessimista * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">
                    {fmtEurRound.format(scenariData[scenariData.length - 1]?.pessimista ?? 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                    {fmtEurRound.format(versatoTotale)}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold">Mediano</span>
                    <span className="text-xs text-muted-foreground block">CAGR storico 2010–2024: {(cagrValue * 100).toFixed(1)}% annuo</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    +{(rMediano * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">
                    {fmtEurRound.format(scenariData[scenariData.length - 1]?.mediano ?? 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                    {fmtEurRound.format(versatoTotale)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-primary">Ottimista</span>
                    <span className="text-xs text-muted-foreground block">Media storica + 1 deviazione standard</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    +{(rOttimista * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-primary">
                    {fmtEurRound.format(scenariData[scenariData.length - 1]?.ottimista ?? 0)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                    {fmtEurRound.format(versatoTotale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grafico scenari */}
        <div className="border border-border p-4">
          <ResponsiveContainer width="100%" height={280} aria-label="Grafico scenari di crescita">
            <LineChart data={scenariData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={tickY}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<ScenariTooltip />} />
              <Line
                type="monotone"
                dataKey="pessimista"
                name="Pessimista"
                stroke="#d4351c"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="mediano"
                name="Mediano"
                stroke="#0b0c0c"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="ottimista"
                name="Ottimista"
                stroke="#00703c"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 text-xs text-muted-foreground justify-center">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5" style={{ backgroundColor: '#d4351c' }} />
              Pessimista
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5" style={{ backgroundColor: '#0b0c0c' }} />
              Mediano
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5" style={{ backgroundColor: '#00703c' }} />
              Ottimista
            </span>
          </div>
        </div>
      </section>

      <Separator className="mb-8" />

      {/* Note finali */}
      <section className="mb-4 text-sm leading-relaxed flex flex-col gap-3 text-muted-foreground">
        <p>
          <strong className="text-[#0b0c0c]">Fonti dati:</strong> I rendimenti annuali sono
          calcolati sul NAV rettificato (adjusted close) degli ETF quotati su Euronext Amsterdam —
          ticker IWDA.AS (IE00B4L5Y983) e IEAG.AS (IE00B4WXJJ64) — tramite Yahoo Finance.
          I dati coprono il periodo 2010–2024, dall'anno successivo alla quotazione di entrambi
          gli ETF (settembre–novembre 2009).
        </p>
        <p>
          <strong className="text-[#0b0c0c]">Limiti del modello:</strong> Gli scenari futuri assumono
          un rendimento annuale costante e non tengono conto dell'impatto della tassazione del 26%
          sui rendimenti, dei costi di transazione, dello spread denaro-lettera, della fiscalità
          sui dividendi distribuiti e del rischio di sequenza dei rendimenti (sequence of returns risk).
          Il capitale finale reale sarà inferiore a quello mostrato.
        </p>
      </section>

      <Separator className="mb-8" />

      {/* Sezione bonus: BTP */}
      <section className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold">Bonus: i BTP</h2>
          <span className="text-xs font-semibold px-2 py-0.5 border border-[#1d70b8] text-[#1d70b8]">
            Interesse semplice
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Un'alternativa ancora più semplice, con caratteristiche fondamentalmente diverse rispetto
          agli ETF e al fondo pensione.
        </p>

        <div className="flex flex-col gap-5 text-sm leading-relaxed">
          <p>
            I <strong>BTP (Buoni del Tesoro Poliennali)</strong> sono titoli di stato emessi dal
            Ministero dell'Economia e delle Finanze. Chi li acquista presta denaro allo Stato
            italiano e riceve in cambio una <strong>cedola fissa semestrale</strong> per tutta la
            durata del titolo, più il rimborso del capitale a scadenza.
          </p>

          <p>
            Funzionano a <strong>interesse semplice</strong>: ogni semestre ricevi la stessa cedola
            calcolata sul capitale nominale iniziale. Quella cedola viene accreditata sul conto
            corrente — non si accumula, non si reinveste automaticamente, non genera rendimento
            su sé stessa.
          </p>

          {/* Callout differenza interesse semplice vs composto */}
          <div className="border-l-4 border-[#0b0c0c] pl-4 py-1">
            <p className="font-semibold mb-2">La differenza con l'interesse composto</p>
            <p className="text-muted-foreground mb-3">
              Con l'interesse semplice il capitale base non cresce mai: dopo 20 anni hai guadagnato
              esattamente 20 volte la cedola annuale. Con l'interesse composto ogni rendimento
              si aggiunge al capitale e genera a sua volta ulteriore rendimento — l'effetto
              valanga che fa la differenza sul lungo periodo.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 pr-6 font-semibold">Scenario</th>
                    <th className="text-right py-1.5 pr-6 font-semibold">Dopo 10 anni</th>
                    <th className="text-right py-1.5 pr-6 font-semibold">Dopo 20 anni</th>
                    <th className="text-right py-1.5 font-semibold">Dopo 30 anni</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="py-1.5 pr-6">
                      <span className="font-medium text-[#0b0c0c]">BTP</span>
                      <span className="block text-[10px]">10.000 € × 4% cedola semplice</span>
                    </td>
                    <td className="py-1.5 pr-6 text-right font-mono">14.000 €</td>
                    <td className="py-1.5 pr-6 text-right font-mono">18.000 €</td>
                    <td className="py-1.5 text-right font-mono">22.000 €</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-6">
                      <span className="font-medium text-[#0b0c0c]">ETF / fondo pensione</span>
                      <span className="block text-[10px]">10.000 € × 4% composto</span>
                    </td>
                    <td className="py-1.5 pr-6 text-right font-mono text-primary">14.802 €</td>
                    <td className="py-1.5 pr-6 text-right font-mono text-primary">21.911 €</td>
                    <td className="py-1.5 text-right font-mono text-primary">32.434 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Stesso tasso del 4%, ma dopo 30 anni la differenza è di oltre 10.000 € su un capitale
              iniziale di 10.000 €. Il divario cresce con il tempo e con il tasso di rendimento.
            </p>
          </div>

          {/* Vantaggi BTP */}
          <div>
            <p className="font-semibold mb-2">Quando i BTP hanno senso</p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-muted-foreground">
              <li>
                <strong className="text-[#0b0c0c]">Obiettivo a scadenza fissa.</strong>{' '}
                Se sai già quando ti servirà il denaro — pensionamento tra 10 anni, acquisto
                casa tra 5 — un BTP con quella scadenza ti garantisce il capitale nominale
                indipendentemente dall'andamento dei mercati.
              </li>
              <li>
                <strong className="text-[#0b0c0c]">Rendita periodica.</strong>{' '}
                Le cedole semestrali sono ideali per chi vuole un flusso di cassa prevedibile
                — ad esempio per integrare la pensione senza dover vendere asset.
              </li>
              <li>
                <strong className="text-[#0b0c0c]">Tassazione agevolata.</strong>{' '}
                I redditi da BTP sono tassati al <strong>12,5%</strong> anziché al 26%
                applicato agli ETF e ai fondi comuni. Un vantaggio fiscale concreto
                rispetto all'investimento azionario.
              </li>
              <li>
                <strong className="text-[#0b0c0c]">Rischio di credito sovrano.</strong>{' '}
                Il rischio principale è l'insolvenza dello Stato italiano, non la volatilità
                di mercato. Per molti investitori è un profilo di rischio psicologicamente
                più gestibile.
              </li>
            </ul>
          </div>

          {/* Limiti BTP */}
          <div>
            <p className="font-semibold mb-2">I limiti da tenere a mente</p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-muted-foreground">
              <li>
                <strong className="text-[#0b0c0c]">Nessun effetto composto automatico.</strong>{' '}
                Le cedole vanno reinvestite manualmente per sfruttare la capitalizzazione.
                Se rimangono sul conto corrente perdono potere d'acquisto per effetto dell'inflazione.
              </li>
              <li>
                <strong className="text-[#0b0c0c]">Rischio di tasso.</strong>{' '}
                Se i tassi di mercato salgono dopo l'acquisto, il prezzo del BTP scende.
                Chi vende prima della scadenza può realizzare una minusvalenza.
              </li>
              <li>
                <strong className="text-[#0b0c0c]">Non è uno strumento di accumulo.</strong>{' '}
                A differenza di un ETF ad accumulazione o di un fondo pensione, un BTP
                non è progettato per far crescere il capitale nel tempo: è uno strumento
                di prestito con restituzione del nominale a scadenza.
              </li>
            </ul>
          </div>

          <p className="text-muted-foreground">
            In sintesi: i BTP e gli ETF non sono in competizione — rispondono a esigenze diverse.
            I BTP sono adatti a proteggere il capitale e ottenere un flusso cedolare certo su un
            orizzonte definito. Gli ETF sono adatti ad accumulare capitale nel lungo periodo
            sfruttando l'interesse composto. Un portafoglio ben strutturato può includere entrambi,
            ma con ruoli distinti.
          </p>
        </div>
      </section>

    </div>
  )
}
