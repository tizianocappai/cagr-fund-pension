import { Separator } from '@/components/ui/separator'

interface Comparto {
  titolo: string
  descrizione: string
  azioni: string
  obbligazioni: string
  rendimentoStorico: string
  orizzonteTemporale: string
  nota: string
  rischioLabel: string
  rischioColor: string
}

const comparti: Comparto[] = [
  {
    titolo: 'Qui non si muove niente',
    descrizione:
      'Il comparto più conservativo. Quasi tutti i soldi sono in obbligazioni: la crescita è lenta e costante, senza grandi salite o discese. Non diventerai ricchissimo velocemente, ma è difficile anche perdere tanto.',
    azioni: '10%',
    obbligazioni: '90%',
    rendimentoStorico: '0,5–1%',
    orizzonteTemporale: 'Breve — fino a 5 anni',
    nota: 'Come tenere i soldi sotto un materasso, ma un po\u2019 più intelligente.',
    rischioLabel: 'Rischio basso',
    rischioColor: '#00703c',
  },
  {
    titolo: 'Eppur si muove',
    descrizione:
      'Una piccola parte dei soldi entra in azioni, il resto resta in obbligazioni. Il valore può salire un po\u2019 di più rispetto al comparto precedente, ma anche scendere leggermente.',
    azioni: '30%',
    obbligazioni: '70%',
    rendimentoStorico: '1–2%',
    orizzonteTemporale: 'Medio — 5–10 anni',
    nota: 'Un equilibrio tra ricerca di rendimento e necessità di stabilità.',
    rischioLabel: 'Rischio medio-basso',
    rischioColor: '#f59e0b',
  },
  {
    titolo: 'Niente male',
    descrizione:
      'Una buona parte dei soldi è investita in azioni. Nel tempo può crescere di più, ma ci saranno anche momenti in cui il valore scende. Serve pazienza.',
    azioni: '60%',
    obbligazioni: '40%',
    rendimentoStorico: '2–4%',
    orizzonteTemporale: 'Lungo — 10–20 anni',
    nota: 'Come le montagne russe: ci sono alti e bassi, ma nel lungo periodo si può arrivare più in alto.',
    rischioLabel: 'Rischio medio-alto',
    rischioColor: '#f97316',
  },
  {
    titolo: 'Forse andrò in pensione',
    descrizione:
      'Il comparto più aggressivo. La maggior parte dei soldi è in azioni: grandi possibilità di crescita, ma anche forti oscillazioni. Nel lungo periodo può dare i risultati più alti.',
    azioni: '80–90%',
    obbligazioni: '10–20%',
    rendimentoStorico: '4–6%',
    orizzonteTemporale: 'Molto lungo — oltre 20 anni',
    nota: 'Come un viaggio avventuroso: può essere faticoso e incerto, ma anche molto gratificante.',
    rischioLabel: 'Rischio alto',
    rischioColor: '#d4351c',
  },
]

export default function RischioRendimento() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Devo rischiare?</h1>
        <p className="mt-2 text-muted-foreground">
          Capire il rapporto tra rischio e rendimento per scegliere il comparto giusto.
        </p>
      </header>

      {/* Introduzione */}
      <div className="flex flex-col gap-4 mb-8 text-sm leading-relaxed">
        <p>
          Immagina di avere un salvadanaio speciale dove puoi mettere i tuoi soldi per farli
          crescere nel tempo. Non esiste però un solo modo di farlo: ci sono diversi{' '}
          <strong>comparti</strong>, cioè diversi modi di investire.
        </p>
        <p>
          Di solito i comparti disponibili sono quattro. La differenza principale tra loro è come
          vengono divisi i soldi tra due categorie:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong>Azioni</strong> — possono crescere tanto, ma anche scendere
          </li>
          <li>
            <strong>Obbligazioni</strong> — crescono più lentamente, ma sono più stabili
          </li>
        </ul>
        <p>
          I nomi usati qui sotto sono <strong>completamente fittizi</strong> e servono solo per
          spiegare il concetto in modo più diretto.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Comparti */}
      <div className="flex flex-col gap-6 mb-8">
        {comparti.map((c, i) => (
          <div key={c.titolo} className="border border-border">
            {/* Header banda colorata */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted">
              <p className="font-bold text-sm">{i + 1}. {c.titolo}</p>
              <span
                className="text-xs font-semibold px-2 py-0.5 border"
                style={{ color: c.rischioColor, borderColor: c.rischioColor }}
              >
                {c.rischioLabel}
              </span>
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
              <p className="text-sm leading-relaxed">{c.descrizione}</p>

              {/* Bilanciamento */}
              <div>
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">
                  Esempio teorico di bilanciamento
                </p>
                <div className="flex gap-6 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Azioni</span>
                    <span className="font-mono font-semibold">{c.azioni}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Obbligazioni</span>
                    <span className="font-mono font-semibold">{c.obbligazioni}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Rendimento storico ipotetico</span>
                    <span className="font-mono font-semibold">{c.rendimentoStorico} annuo</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Orizzonte temporale indicativo</span>
                    <span className="font-mono font-semibold">{c.orizzonteTemporale}</span>
                  </div>
                </div>
              </div>

              {/* Barra visiva */}
              <div className="flex h-3 w-full overflow-hidden border border-border">
                <div
                  className="h-full bg-error transition-all"
                  style={{ width: c.azioni.replace('–', '-').split(/[-–]/)[0].trim() }}
                />
                <div className="h-full flex-1 bg-border" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground -mt-2">
                <span>Azioni</span>
                <span>Obbligazioni</span>
              </div>

              <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">
                {c.nota}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="mb-8" />

      {/* Nota importante */}
      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-4 text-sm leading-relaxed flex flex-col gap-2">
        <p className="font-bold">Nota importante</p>
        <p>
          Le percentuali indicate sono <strong>solo teoriche</strong> e servono come riferimento
          per capire il livello di rischio e come viene bilanciato il portafoglio tra azioni e
          obbligazioni. Nella realtà ogni fondo pensione può avere percentuali diverse e variabili
          nel tempo in base alla strategia adottata.
        </p>
        <p>
          Scegliere il comparto giusto dipende da quanto sei disposto a vedere i tuoi soldi salire
          e scendere nel tempo, e da quanto manca al momento in cui vorrai utilizzarli.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Cosa dice la ricerca */}
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-base font-bold mb-1 border-l-4 border-[#0b0c0c] pl-3">
            Cosa dice la ricerca: il tempo abbassa il rischio
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Uno degli insegnamenti più solidi della finanza storica è che il rischio di perdere
            denaro si riduce drasticamente all'aumentare dell'orizzonte temporale. Non è una
            promessa, ma un dato che si ripete con grande coerenza su oltre un secolo di mercati.
          </p>
        </div>

        {/* Tabella probabilità perdita */}
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
            Probabilità storica di rendimento negativo — mercato azionario globale (1900–2023)
          </p>
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Orizzonte temporale</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Probabilità di perdita</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Rendimento medio annuo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { periodo: '1 anno',   perdita: '~28%', rendimento: '~9,5%' },
                  { periodo: '5 anni',   perdita: '~14%', rendimento: '~8,5%' },
                  { periodo: '10 anni',  perdita: '~5%',  rendimento: '~8%'   },
                  { periodo: '20 anni',  perdita: '<1%',  rendimento: '~7,5%' },
                  { periodo: '30 anni',  perdita: '0%',   rendimento: '~7%'   },
                ].map((r, i) => (
                  <tr key={r.periodo} className={i % 2 === 0 ? 'bg-card' : 'bg-muted'}>
                    <td className="px-3 py-2 font-medium">{r.periodo}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.perdita}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.rendimento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dati basati su MSCI World e S&P 500, rendimenti nominali in dollari. Fonte: Dimson, Marsh &amp; Staunton,{' '}
            <em>Triumph of the Optimists</em> (2002) aggiornato al 2023 tramite{' '}
            <a href="https://www.credit-suisse.com/about-us/en/reports-research/csri.html" target="_blank" rel="noopener noreferrer">
              Credit Suisse Global Investment Returns Yearbook
            </a>.
          </p>
        </div>

        {/* Principi chiave */}
        <div className="flex flex-col gap-4 text-sm leading-relaxed">
          <div className="border-l-4 border-[#0b0c0c] pl-3">
            <p className="font-semibold mb-1">Il principio della "regressione alla media"</p>
            <p className="text-muted-foreground">
              Nel breve periodo i mercati oscillano in modo imprevedibile. Nel lungo periodo tendono
              a tornare verso la loro media storica di crescita. Jeremy Siegel, nel suo studio
              pluridecennale sui mercati azionari USA dal 1802 al 2012, ha mostrato che nessun
              periodo di 20 anni consecutivi ha mai chiuso in negativo in termini reali.
              Fonte:{' '}
              <a href="https://www.amazon.com/dp/0071800514" target="_blank" rel="noopener noreferrer">
                Siegel, <em>Stocks for the Long Run</em>, 5ª ed. (2014)
              </a>.
            </p>
          </div>

          <div className="border-l-4 border-[#0b0c0c] pl-3">
            <p className="font-semibold mb-1">I fondi pensione italiani nel lungo periodo</p>
            <p className="text-muted-foreground">
              Secondo il rapporto COVIP 2023, i comparti azionari dei fondi pensione negoziali
              italiani hanno registrato un rendimento medio netto annualizzato del{' '}
              <strong className="text-foreground">+4,7%</strong> su un orizzonte di 10 anni
              (2013–2023), contro il +2,1% dei comparti obbligazionari puri. Il TFR lasciato
              in azienda nello stesso periodo si è rivalutato in media dell'1,7% annuo.
              Fonte:{' '}
              <a href="https://www.covip.it/pubblicazioni-e-statistiche/relazione-annuale" target="_blank" rel="noopener noreferrer">
                COVIP, Relazione annuale 2023
              </a>.
            </p>
          </div>

          <div className="border-l-4 border-[#0b0c0c] pl-3">
            <p className="font-semibold mb-1">La regola pratica del "glide path"</p>
            <p className="text-muted-foreground">
              Molti fondi pensione adottano una strategia di <em>lifecycle</em>: si inizia con
              un comparto azionario quando si è giovani e si ha davanti decenni di accumulo, per
              poi spostarsi progressivamente verso comparti più conservativi man mano che ci si
              avvicina alla pensione. Questa logica è supportata da ricerche Vanguard che mostrano
              come la riduzione graduale del rischio nei 10 anni pre-pensione minimizzi l'impatto
              di un eventuale crollo di mercato sul capitale accumulato.
              Fonte:{' '}
              <a href="https://institutional.vanguard.com/content/dam/inst/vanguard-has/insights-pdfs/glide-path-research.pdf" target="_blank" rel="noopener noreferrer">
                Vanguard, <em>Vanguard's approach to target-date funds</em> (2023)
              </a>.
            </p>
          </div>
        </div>

        <div className="border-l-4 border-error bg-[#fde8e6] px-4 py-3 text-xs leading-relaxed">
          I dati storici non garantiscono rendimenti futuri. Le performance passate dei mercati
          finanziari non sono indicative di quelle future. Questo contenuto ha scopo puramente
          educativo e non costituisce consulenza finanziaria.
        </div>
      </div>

    </div>
  )
}
