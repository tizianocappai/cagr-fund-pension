import { Separator } from '@/components/ui/separator'

const steps = [
  {
    number: '01',
    title: 'Accedi a Fondo Cometa',
    description: 'Vai sul portale di Fondo Cometa e autenticati con le tue credenziali personali.',
  },
  {
    number: '02',
    title: 'Apri l\'elenco completo delle operazioni',
    description: (
      <>
        Dalla <strong>home page</strong> del portale, scorri fino in fondo alla pagina e clicca sul
        pulsante <strong>"Clicca qui per l'elenco completo"</strong>. Verrai reindirizzato alla
        pagina con tutte le operazioni del tuo fondo.
        <img
          src="/cometa-guide-step-2.png"
          alt="Screenshot del portale Cometa — pulsante Clicca qui per l'elenco completo"
          className="mt-4 border border-border w-full max-w-lg"
        />
      </>
    ),
  },
  {
    number: '03',
    title: 'Esporta il dettaglio delle operazioni',
    description: (
      <>
        Nella pagina delle operazioni, clicca su <strong>"Esporta il dettaglio delle operazioni"</strong>{' '}
        contrassegnato dall'icona verde. Il file <code className="text-xs bg-[--color-muted] px-1.5 py-0.5 rounded font-mono">.xls</code> verrà
        scaricato automaticamente sul tuo dispositivo.
        <img
          src="/cometa-guide-step-3.png"
          alt="Screenshot del portale Cometa — pulsante Esporta il dettaglio delle operazioni"
          className="mt-4 border border-border w-full max-w-lg"
        />
      </>
    ),
  },
  {
    number: '04',
    title: 'Carica il file su questo sito',
    description: (
      <>
        Torna sulla pagina <strong>Cometa</strong> di questo sito e trascina il file scaricato
        nell'area di upload, oppure clicca per sfogliare e selezionarlo manualmente.
      </>
    ),
  },
  {
    number: '05',
    title: 'Inserisci il valore attuale della posizione',
    description: (
      <>
        Torna sulla <strong>home page di Fondo Cometa</strong>: trovi il{' '}
        <strong>valore attuale della tua posizione individuale</strong> riepilogato in cima alla
        pagina. Inserisci questo importo nel campo apposito sul sito, poi clicca{' '}
        <strong>Calcola Rendimento</strong>.
        <img
          src="/cometa-guide-step-5.png"
          alt="Screenshot del portale Cometa — valore attuale della posizione individuale"
          className="mt-4 border border-border w-full max-w-lg"
        />
      </>
    ),
  },
]

export default function CometaGuide() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold"><span aria-hidden="true">📖</span> Guida all'utilizzo</h1>
        <p className="mt-2 text-muted-foreground">
          Segui questi 5 passi per calcolare il tasso di crescita medio annuo del tuo fondo pensione Cometa.
        </p>
      </header>

        <Separator className="mb-10" />

        <ol className="flex flex-col gap-0">
          {steps.map((step, i) => (
            <li key={step.number} className="flex gap-6">
              {/* Left column: number + connector line */}
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[--color-foreground] bg-[--color-foreground] text-[--color-background] text-xs font-bold">
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-[--color-border] my-1" />
                )}
              </div>

              {/* Right column: content */}
              <div className={i < steps.length - 1 ? 'pb-10' : 'pb-0'}>
                <div className="mb-1">
                  <h2 className="font-semibold">{step.title}</h2>
                </div>
                <div className="text-sm text-[--color-muted-foreground] leading-relaxed">
                  {step.description}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <Separator className="mt-10 mb-8" />

        <div className="rounded-[--radius] border border-[--color-border] bg-[--color-muted] px-5 py-4">
          <p className="text-xs text-[--color-muted-foreground] leading-relaxed">
            <strong className="text-[--color-foreground]">Privacy:</strong> il file che carichi
            non viene mai inviato a nessun server. Tutto il calcolo avviene interamente nel tuo
            browser — i tuoi dati rimangono sul tuo dispositivo.
          </p>
        </div>

    </div>
  )
}
