import * as React from 'react'
import { Link } from 'react-router'
import { useMeta } from '@/lib/useMeta'
import { CagrCalculator } from '@/components/CagrCalculator'
import { Alert, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { clearFile, loadFile, saveFile } from '@/lib/fileStorage'
import { parseFonte } from '@/lib/parseFonte'
import { parseAmundi } from '@/lib/parseAmundi'
import type { Transaction } from '@/lib/parseXls'
import type { Flow } from '@/components/ForecastChart'
import { type Provider, columnsByProvider } from '@/lib/providerConfig'

const { Dragger } = Upload

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
  useMeta(
    'Calcola il rendimento del tuo fondo pensione',
    'Carica il file del tuo fondo pensione (Cometa, Fonte, Amundi) e calcola il tasso di crescita medio annuo reale con il metodo XIRR. Vedi commissioni, versamenti e proiezione futura.',
  )
  const [provider,    setProvider]    = React.useState<Provider | null>(null)
  const [file,        setFile]        = React.useState<File | null>(null)
  const [ready,       setReady]       = React.useState(false)

  React.useEffect(() => {
    if (!provider) {
      setFile(null)
      setReady(false)
      return
    }
    setFile(null)
    setReady(false)
    loadFile(provider)
      .then(f => { if (f) { setFile(f) } })
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
    await clearFile(provider).catch(() => {})
  }

  // Amundi output is identical to Cometa flow
  const flow: Flow = provider === 'fonte' ? 'fonte' : 'cometa'

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-[36px] leading-[44px] font-normal">Rendimento Fondo Pensione</h1>
        <p className="mt-2 text-muted-foreground">
          Calcola il tasso di crescita medio annuo del tuo fondo pensione complementare.
        </p>
        <div className="mt-4">
          <p className="text-[12px] leading-[16px] tracking-[0.5px] font-medium uppercase text-on-surface-variant mb-2">Fondi supportati</p>
          <ul className="list-disc list-inside text-[14px] leading-[20px] tracking-[0.25px] text-on-surface space-y-1 pl-1">
            {providers.map(p => (
              <li key={p.value}>{p.label}</li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-[12px] leading-[16px] tracking-[0.4px] text-muted-foreground">
          Non trovi il tuo fondo?{' '}
          <a href="mailto:tiziano.cappai1999@gmail.com">Scrivimi</a>
          {' '}per richiedere il supporto.
        </p>
      </header>

      {/* Provider selector */}
      <div className="flex flex-col gap-1 mb-8 max-w-xs">
        <label htmlFor="provider" className="text-[12px] leading-[16px] tracking-[0.4px] tracking-widest uppercase text-muted-foreground">
          Seleziona il tuo fondo
        </label>
        <select
          id="provider"
          value={provider ?? ''}
          onChange={e => setProvider((e.target.value as Provider) || null)}
          className="h-14 border border-outline bg-surface px-4 text-[16px] leading-[24px] tracking-[0.5px] rounded-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 appearance-none cursor-pointer transition-colors duration-200"
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
            <Alert
              type="info"
              showIcon
              className="mb-6"
              description={
                <>
                  Prima volta? Leggi la{' '}
                  <Link to="/cometa-guide">guida passo passo</Link>{' '}
                  per sapere come esportare il file dal portale Fondo Cometa.
                </>
              }
            />
          )}

          <Dragger
            accept=".xls,.xlsx"
            maxCount={1}
            fileList={file ? [{
              uid: '-1',
              name: file.name,
              status: 'done',
              size: file.size,
            }] : []}
            beforeUpload={(uploadFile) => {
              handleFileSelect(uploadFile as File)
              return false
            }}
            onRemove={() => {
              handleClear()
              return true
            }}
            className={file ? 'py-6' : undefined}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Trascina qui il file o clicca per sfogliare</p>
            <p className="ant-upload-hint">.xls, .xlsx</p>
          </Dragger>

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
