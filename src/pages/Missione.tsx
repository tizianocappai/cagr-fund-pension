import { Separator } from '@/components/ui/separator'

const sections = [
  {
    emoji: '🎯',
    title: 'Perché questo progetto',
    content: (
      <>
        <p>
          La maggior parte dei lavoratori italiani ha un fondo pensione complementare, ma pochissimi
          sanno quanto rende davvero. I portali dei fondi mostrano saldi e movimenti, ma non ti
          dicono mai <strong>una cosa semplice: a che tasso cresce il tuo denaro ogni anno</strong>.
        </p>
        <p className="mt-3">
          Questo sito nasce per colmare quel vuoto: carica il file del tuo fondo, inserisci il
          valore attuale, e in pochi secondi scopri il tuo <strong>tasso di crescita medio annuo reale</strong> — calcolato
          con il metodo XIRR, lo stesso usato dai professionisti della finanza.
        </p>
      </>
    ),
  },
  {
    emoji: '🏗️',
    title: 'Come funziona un fondo pensione complementare',
    content: (
      <>
        <p>
          Ogni mese sul fondo confluiscono (almeno) tre flussi distinti:
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-[--color-muted-foreground]">
          <li className="flex gap-3">
            <span className="text-base shrink-0">👤</span>
            <span>
              <strong className="text-[--color-foreground]">Quota aderente</strong> — quello che
              versi tu, tipicamente una percentuale fissa del tuo stipendio lordo.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">🏢</span>
            <span>
              <strong className="text-[--color-foreground]">Quota azienda</strong> — il contributo
              aggiuntivo che il datore di lavoro è contrattualmente obbligato a versare nel momento
              in cui tu versi la tua quota. Questi soldi <em>non li avresti mai ricevuti</em> in
              busta paga.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">📦</span>
            <span>
              <strong className="text-[--color-foreground]">TFR</strong> — il trattamento di fine
              rapporto, che invece di accumularsi in azienda (dove renderebbe pochissimo per legge)
              viene investito nel fondo.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    emoji: '🎁',
    title: 'Il vantaggio nascosto: la quota azienda',
    content: (
      <>
        <p>
          Immagina di versare <strong>100 € al mese</strong>. Il tuo datore di lavoro aggiunge
          subito altri <strong>50 €</strong>. Nel momento stesso in cui investi 100 €, il tuo
          portafoglio cresce di 150 €: hai già un rendimento immediato del <strong>+50%</strong>{' '}
          prima ancora che il mercato si muova di un centesimo.
        </p>
        <p className="mt-3">
          Questa è la ragione per cui il tasso di crescita "senza azienda" (la sezione <em>Bonus</em> del
          calcolatore) è spesso molto più alto di quello standard: misura quanto rende il denaro
          che hai <em>davvero speso di tasca tua</em>, al netto di questa leva gratuita.
        </p>
        <p className="mt-3">
          Rinunciare al fondo pensione — o non versare la quota minima per attivare il contributo
          aziendale — equivale a <strong>rifiutare un aumento di stipendio</strong>.
        </p>
      </>
    ),
  },
  {
    emoji: '📈',
    title: 'L\'interesse composto nel lungo periodo',
    content: (
      <>
        <p>
          Un fondo pensione è uno strumento di <strong>lungo periodo</strong>: tipicamente 20–40
          anni di accumulo. Su questi orizzonti temporali, anche piccole differenze di rendimento
          producono risultati enormi grazie alla capitalizzazione composta.
        </p>
        <div className="mt-4 overflow-x-auto rounded-[--radius] border border-[--color-border]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-muted]">
                <th className="px-3 py-2 text-left font-medium text-[--color-muted-foreground]">Tasso annuo</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">10 anni</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">20 anni</th>
                <th className="px-3 py-2 text-right font-medium text-[--color-muted-foreground]">30 anni</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rate: '2%', v10: '×1,22', v20: '×1,49', v30: '×1,81' },
                { rate: '4%', v10: '×1,48', v20: '×2,19', v30: '×3,24' },
                { rate: '6%', v10: '×1,79', v20: '×3,21', v30: '×5,74' },
                { rate: '8%', v10: '×2,16', v20: '×4,66', v30: '×10,06' },
              ].map((row, i) => (
                <tr key={row.rate} className={i % 2 === 0 ? 'bg-[--color-card]' : 'bg-[--color-muted]'}>
                  <td className="px-3 py-2 font-mono font-medium">{row.rate}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.v10}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.v20}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{row.v30}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[--color-muted-foreground]">
          Moltiplicatore del capitale iniziale, senza contributi aggiuntivi.
        </p>
      </>
    ),
  },
  {
    emoji: '🔍',
    title: 'Perché conoscere il proprio tasso di crescita è importante',
    content: (
      <>
        <p>
          Sapere che il tuo fondo ha reso il <strong>5,3% annuo</strong> ti permette di:
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-[--color-muted-foreground]">
          <li className="flex gap-3">
            <span className="text-base shrink-0">⚖️</span>
            <span>
              <strong className="text-[--color-foreground]">Confrontare i comparti</strong> — il
              tuo fondo offre solitamente più linee di investimento (garantita, bilanciata,
              azionaria). Conoscere il rendimento storico ti aiuta a scegliere consapevolmente.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">📅</span>
            <span>
              <strong className="text-[--color-foreground]">Pianificare la pensione</strong> — con
              un tasso realistico puoi usare la sezione "Proiezione futura" per stimare quanto avrai
              accumulato al momento del ritiro.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">🧾</span>
            <span>
              <strong className="text-[--color-foreground]">Valutare i costi</strong> — le spese
              (commissioni di gestione, quota spese) erodono il rendimento ogni anno. Renderle
              visibili è il primo passo per capire se stai pagando troppo.
            </span>
          </li>
        </ul>
      </>
    ),
  },
  {
    emoji: '🚀',
    title: 'Il messaggio finale',
    content: (
      <>
        <p>
          Il fondo pensione complementare è probabilmente <strong>il miglior investimento che un
          lavoratore dipendente italiano possa fare</strong>: contributo aziendale gratuito,
          deduzione fiscale sui versamenti, tassazione agevolata sui rendimenti (20% invece del
          26%), e decenni di interesse composto a disposizione.
        </p>
        <p className="mt-3">
          Eppure la maggior parte delle persone non sa nemmeno quanto rende. Questo sito esiste
          per cambiare quella cosa — un file Excel alla volta.
        </p>
      </>
    ),
  },
]

export default function Missione() {
  return (
    <div className="bg-[--color-background] text-[--color-foreground]">
      <div className="mx-auto max-w-2xl px-6 py-12">

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">La nostra missione 🧭</h1>
          <p className="mt-2 text-sm text-[--color-muted-foreground]">
            Perché abbiamo costruito questo strumento e perché il fondo pensione è più importante
            di quanto pensi.
          </p>
        </header>

        <Separator className="mb-10" />

        <div className="flex flex-col gap-10">
          {sections.map((section, i) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden="true">{section.emoji}</span>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <div className="text-sm text-[--color-muted-foreground] leading-relaxed">
                {section.content}
              </div>
              {i < sections.length - 1 && <Separator className="mt-10" />}
            </div>
          ))}
        </div>

        <Separator className="mt-10 mb-8" />

        <div className="rounded-[--radius] border border-[--color-border] bg-[--color-muted] px-5 py-4">
          <p className="text-xs text-[--color-muted-foreground] leading-relaxed">
            ℹ️ <strong className="text-[--color-foreground]">Nota:</strong> i dati e gli esempi
            riportati sono a scopo illustrativo. Per decisioni finanziarie personali consulta sempre
            un consulente finanziario indipendente.
          </p>
        </div>

      </div>
    </div>
  )
}
