import { Separator } from '@/components/ui/separator'

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Ultimo aggiornamento: marzo 2026</p>
      </header>

      <div className="border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-4 text-sm leading-relaxed mb-8">
        <p>
          Questo sito non raccoglie né trasmette dati finanziari personali. Tutti i calcoli avvengono
          interamente nel tuo browser. I file che carichi non vengono mai inviati a server esterni.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="flex flex-col gap-8">

        <section>
          <h2 className="text-xl font-bold mb-3">Titolare del trattamento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cappai Tiziano — <a href="mailto:tiziano.cappai1999@gmail.com">tiziano.cappai1999@gmail.com</a>
          </p>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-3">Dati trattati e finalità</h2>
          <div className="flex flex-col gap-4 text-sm leading-relaxed">

            <div className="border-l-4 border-[#0b0c0c] bg-muted px-4 py-3">
              <p className="font-semibold mb-1">1. Dati di navigazione — Vercel Analytics</p>
              <p className="text-muted-foreground">
                Con il tuo consenso, questo sito utilizza <strong className="text-foreground">Vercel Analytics</strong> per
                raccogliere statistiche aggregate e anonime sulle visite: pagine visitate, paese di provenienza,
                tipo di dispositivo e browser. Nessun dato personale identificabile viene raccolto.
                Il servizio è fornito da Vercel Inc. — consulta la loro{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </p>
              <p className="text-muted-foreground mt-1">Base giuridica: consenso (Art. 6(1)(a) GDPR).</p>
            </div>

            <div className="border-l-4 border-[#0b0c0c] bg-muted px-4 py-3">
              <p className="font-semibold mb-1">2. Widget Buy Me a Coffee</p>
              <p className="text-muted-foreground">
                Con il tuo consenso, viene caricato il widget di <strong className="text-foreground">Buy Me a Coffee</strong>,
                un servizio di supporto volontario esterno. Il widget può impostare cookie propri.
                Consulta la loro{' '}
                <a href="https://www.buymeacoffee.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </p>
              <p className="text-muted-foreground mt-1">Base giuridica: consenso (Art. 6(1)(a) GDPR).</p>
            </div>

            <div className="border-l-4 border-[#0b0c0c] bg-muted px-4 py-3">
              <p className="font-semibold mb-1">3. Dati salvati localmente (localStorage)</p>
              <p className="text-muted-foreground">
                Il sito salva nel tuo browser le seguenti preferenze, che non vengono mai trasmesse a server:
              </p>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground flex flex-col gap-0.5">
                <li><code className="text-xs bg-border px-1">gennaro_disclaimer_accepted</code> — conferma lettura avviso legale</li>
                <li><code className="text-xs bg-border px-1">gennaro_cookie_consent</code> — preferenza cookie</li>
                <li>File Excel caricati (IndexedDB) — solo per evitare di ricaricarli ad ogni visita</li>
              </ul>
              <p className="text-muted-foreground mt-1">Base giuridica: interesse legittimo / funzionamento del servizio.</p>
            </div>

          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-3">I tuoi diritti (GDPR)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            In qualità di utente hai diritto di:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-1">
            <li>Accedere ai dati che ti riguardano</li>
            <li>Richiedere la rettifica o cancellazione</li>
            <li>Opporti al trattamento o richiederne la limitazione</li>
            <li>Revocare il consenso in qualsiasi momento (cancella i dati del browser per questo sito)</li>
            <li>Proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">garanteprivacy.it</a>)</li>
          </ul>
        </section>

        <Separator />

        <section>
          <h2 className="text-xl font-bold mb-3">Contatti</h2>
          <p className="text-sm text-muted-foreground">
            Per qualsiasi richiesta relativa alla privacy:{' '}
            <a href="mailto:tiziano.cappai1999@gmail.com">tiziano.cappai1999@gmail.com</a>
          </p>
        </section>

      </div>
    </div>
  )
}
