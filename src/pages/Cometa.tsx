import * as React from 'react'
import { Link } from 'react-router'
import { CagrCalculator } from '@/components/CagrCalculator'
import { FileUploader } from '@/components/ui/file-uploader'
import { clearFile, loadFile, saveFile } from '@/lib/fileStorage'

export default function Cometa() {
  const [file, setFile] = React.useState<File | null>(null)
  const [initialFile, setInitialFile] = React.useState<File | null>(null)
  const [restoring, setRestoring] = React.useState(true)

  React.useEffect(() => {
    loadFile('cometa')
      .then(f => { if (f) { setInitialFile(f); setFile(f) } })
      .catch(() => {})
      .finally(() => setRestoring(false))
  }, [])

  async function handleFileSelect(f: File) {
    setFile(f)
    await saveFile(f, 'cometa').catch(() => {})
  }

  async function handleClear() {
    setFile(null)
    setInitialFile(null)
    await clearFile('cometa').catch(() => {})
  }

  if (restoring) return null

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <div className="mb-6 border-l-4 border-[#1d70b8] bg-[#e8f1f8] px-4 py-3 text-sm">
        Prima volta? Leggi la{' '}
        <Link to="/cometa-guide">guida passo passo</Link>{' '}
        per sapere come esportare il file dal portale Fondo Cometa.
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">☄️ Fondo Cometa</h1>
        <p className="mt-2 text-muted-foreground">
          Carica il file XLS esportato dal portale del fondo pensione Cometa.
        </p>
      </header>

      <FileUploader
        accept=".xls,.xlsx"
        initialFile={initialFile}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        className={file ? 'py-6' : undefined}
      />

      {file && <CagrCalculator file={file} flow="cometa" />}

    </div>
  )
}
