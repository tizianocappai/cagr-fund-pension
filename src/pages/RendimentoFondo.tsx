import * as React from 'react'
import { Link } from 'react-router'
import { CagrCalculator } from '@/components/CagrCalculator'
import { FileUploader } from '@/components/ui/file-uploader'
import { clearFile, loadFile, saveFile } from '@/lib/fileStorage'
import { parseFonte } from '@/lib/parseFonte'
import { parseAmundi } from '@/lib/parseAmundi'
import type { Transaction } from '@/lib/parseXls'
import type { Flow } from '@/components/ForecastChart'
import { type Provider, columnsByProvider } from '@/lib/providerConfig'

const providers: { value: Provider; label: string }[] = [
  { value: 'cometa', label: 'Fondo Cometa'           },
  { value: 'fonte',  label: 'Fondo Fonte'             },
  { value: 'amundi', label: 'Amundi SecondaPensione'  },
]

function getParser(provider: Provider): ((rows: string[][]) => Transaction[]) | undefined {
  if (provider === 'fonte')  return parseFonte
  if (provider === 'amundi') return parseAmundi
  return undefined // cometa uses the default parseXls inside CagrCalculator
}

export default function RendimentoFondo() {
  const [provider,    setProvider]    = React.useState<Provider | null>(null)
  const [file,        setFile]        = React.useState<File | null>(null)
  const [initialFile, setInitialFile] = React.useState<File | null>(null)
  const [ready,       setReady]       = React.useState(false)

  React.useEffect(() => {
    if (!provider) {
      setFile(null)
      setInitialFile(null)
      setReady(false)
      return
    }
    setFile(null)
    setInitialFile(null)
    setReady(false)
    loadFile(provider)
      .then(f => { if (f) { setInitialFile(f); setFile(f) } })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [provider])

  async function handleFileSelect(f: File) {
    if (!provider) return
    setFile(f)
    await saveFile(f, provider).catch(() => {})
  }

  async function handleClear() {
    if (!provider) return
    setFile(null)
    setInitialFile(null)
    await clearFile(provider).catch(() => {})
  }

  // Amundi output is identical to Cometa flow
  const flow: Flow = provider === 'fonte' ? 'fonte' : 'cometa'

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold">📐 Rendimento Fondo Pensione</h1>
        <p className="mt-2 text-muted-foreground">
          Calcola il tasso di crescita medio annuo del tuo fondo pensione complementare.
        </p>
        <div className="mt-4 text-sm">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Fondi supportati</p>
          <ul className="flex flex-col gap-1">
            {providers.map(p => (
              <li key={p.value} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-primary shrink-0" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Provider selector */}
      <div className="flex flex-col gap-1 mb-8 max-w-xs">
        <label htmlFor="provider" className="text-xs tracking-widest uppercase text-muted-foreground">
          Seleziona il tuo fondo
        </label>
        <select
          id="provider"
          value={provider ?? ''}
          onChange={e => setProvider((e.target.value as Provider) || null)}
          className="border-2 border-[#0b0c0c] bg-white px-3 py-2 text-sm font-mono focus-visible:outline-3 focus-visible:outline-[#ffdd00] focus-visible:outline-offset-0 appearance-none cursor-pointer"
        >
          <option value="">Seleziona un fondo...</option>
          {providers.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Content — only rendered once the IndexedDB lookup is complete */}
      {provider && ready && (
        <div key={provider}>
          {provider === 'cometa' && (
            <div className="mb-6 border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-3 text-sm">
              Prima volta? Leggi la{' '}
              <Link to="/cometa-guide">guida passo passo</Link>{' '}
              per sapere come esportare il file dal portale Fondo Cometa.
            </div>
          )}

          <FileUploader
            accept=".xls,.xlsx"
            initialFile={initialFile}
            onFileSelect={handleFileSelect}
            onClear={handleClear}
            className={file ? 'py-6' : undefined}
          />

          {file && (
            <CagrCalculator
              file={file}
              flow={flow}
              parser={getParser(provider)}
              columns={columnsByProvider[provider]}
            />
          )}
        </div>
      )}

    </div>
  )
}
