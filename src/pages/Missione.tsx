import { Link } from 'react-router'
import { Separator } from '@/components/ui/separator'

const features = [
  {
    to: '/',
    label: 'Rendimento Fondo Pensione',
    description:
      'Carica il file del tuo fondo e scopri il tasso di crescita medio annuo reale, calcolato con il metodo XIRR. Vedi quanto ha reso ogni anno, quanto hai versato e quanto ti è costato in commissioni.',
  },
  {
    to: '/fp-vs-tfr',
    label: 'FP vs TFR',
    description:
      'Confronta cosa succede al tuo TFR se rimane in azienda oppure viene versato nel fondo pensione. Simula i due scenari con i tuoi numeri reali e vedi la differenza nel lungo periodo.',
  },
  {
    to: '/obiettivo',
    label: 'Come dovrei fare?',
    description:
      'Parti dal risultato che vuoi ottenere. Inserisci il capitale obiettivo, il rendimento atteso e gli anni a disposizione: la pagina ti dice quanto devi mettere da parte ogni anno — e ogni mese.',
  },
  {
    to: '/rischio-rendimento',
    label: 'Devo rischiare?',
    description:
      'Capire i comparti di investimento non è complicato. Questa sezione spiega la differenza tra azionario e obbligazionario, i rendimenti storici per ogni livello di rischio e perché il tempo è il tuo alleato più importante.',
  },
]

export default function Missione() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold">🧭 Missione</h1>
        <p className="mt-2 text-muted-foreground">
          Tutto quello che trovi su questo sito, spiegato in due righe.
        </p>
      </header>

      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-4 text-sm leading-relaxed mb-8">
        <p>
          La maggior parte dei lavoratori italiani ha un fondo pensione, ma pochissimi sanno quanto
          rende davvero. Gennaro esiste per colmare quel vuoto: strumenti semplici, numeri veri,
          nessuna consulenza finanziaria — solo chiarezza.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="flex flex-col gap-px border border-border">
        {features.map(f => (
          <div key={f.to} className="px-5 py-5 bg-card flex flex-col gap-2 border-b border-border last:border-b-0">
            <Link to={f.to} className="font-bold text-base">
              {f.label}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      <Separator className="mt-8 mb-6" />

      <p className="text-xs text-muted-foreground leading-relaxed">
        I risultati hanno scopo puramente indicativo. Per decisioni finanziarie personali
        consulta sempre un consulente finanziario indipendente.
      </p>

    </div>
  )
}
