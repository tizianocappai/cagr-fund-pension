import * as React from 'react'
import { CagrCalculator } from '@/components/CagrCalculator'
import { columnsByProvider } from '@/lib/providerConfig'
import { FileUploader } from '@/components/ui/file-uploader'
import { clearFile, loadFile, saveFile } from '@/lib/fileStorage'
import { parseFonte } from '@/lib/parseFonte'

export default function Fonte() {
  const [file, setFile] = React.useState<File | null>(null)
  const [initialFile, setInitialFile] = React.useState<File | null>(null)
  const [restoring, setRestoring] = React.useState(true)

  React.useEffect(() => {
    loadFile('fonte')
      .then(f => { if (f) { setInitialFile(f); setFile(f) } })
      .catch(() => {})
      .finally(() => setRestoring(false))
  }, [])

  async function handleFileSelect(f: File) {
    setFile(f)
    await saveFile(f, 'fonte').catch(() => {})
  }

  async function handleClear() {
    setFile(null)
    setInitialFile(null)
    await clearFile('fonte').catch(() => {})
  }

  if (restoring) return null

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-3xl font-bold">🌊 Fondo Fonte</h1>
        <p className="mt-2 text-muted-foreground">
          Carica il file XLS esportato dal portale del fondo pensione Fonte.
        </p>
      </header>

      <FileUploader
        accept=".xls,.xlsx"
        initialFile={initialFile}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        className={file ? 'py-6' : undefined}
      />

      {file && <CagrCalculator file={file} flow="fonte" parser={parseFonte} columns={columnsByProvider['fonte']} />}

    </div>
  )
}
