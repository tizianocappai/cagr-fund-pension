import { Separator } from '@/components/ui/separator'

const steps = [
  {
    number: '01',
    emoji: '🔐',
    title: 'Accedi a Fondo Cometa',
    description: 'Vai sul portale di Fondo Cometa e autenticati con le tue credenziali personali.',
  },
  {
    number: '02',
    emoji: '📋',
    title: 'Apri l\'elenco completo delle operazioni',
    description: (
      <>
        Dalla <strong>home page</strong> del portale, scorri fino in fondo alla pagina e clicca sul
        pulsante <strong>"Clicca qui per l'elenco completo"</strong>. Verrai reindirizzato alla
        pagina con tutte le operazioni del tuo fondo.
      </>
    ),
  },
  {
    number: '03',
    emoji: '📥',
    title: 'Esporta il dettaglio delle operazioni',
    description: (
      <>
        Nella pagina delle operazioni, clicca su <strong>"Esporta il dettaglio delle operazioni"</strong>{' '}
        contrassegnato dall'icona verde. Il file <code className="text-xs bg-[--color-muted] px-1.5 py-0.5 rounded font-mono">.xls</code> verrà
        scaricato automaticamente sul tuo dispositivo.
      </>
    ),
  },
  {
    number: '04',
    emoji: '☄️',
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
    emoji: '💼',
    title: 'Inserisci il valore attuale della posizione',
    description: (
      <>
        Torna sulla <strong>home page di Fondo Cometa</strong>: trovi il{' '}
        <strong>valore attuale della tua posizione individuale</strong> riepilogato in cima alla
        pagina. Inserisci questo importo nel campo apposito sul sito, poi clicca{' '}
        <strong>Calcola Rendimento</strong>.
      </>
    ),
  },
]

export default function CometaGuide() {
  return (
    <div className="bg-[--color-background] text-[--color-foreground]">
      <div className="mx-auto max-w-2xl px-6 py-12">

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Guida all'utilizzo 📖</h1>
          <p className="mt-2 text-sm text-[--color-muted-foreground]">
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl" aria-hidden="true">{step.emoji}</span>
                  <h2 className="font-semibold">{step.title}</h2>
                </div>
                <p className="text-sm text-[--color-muted-foreground] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Separator className="mt-10 mb-8" />

        <div className="rounded-[--radius] border border-[--color-border] bg-[--color-muted] px-5 py-4">
          <p className="text-xs text-[--color-muted-foreground] leading-relaxed">
            🔒 <strong className="text-[--color-foreground]">Privacy:</strong> il file che carichi
            non viene mai inviato a nessun server. Tutto il calcolo avviene interamente nel tuo
            browser — i tuoi dati rimangono sul tuo dispositivo.
          </p>
        </div>

      </div>
    </div>
  )
}
