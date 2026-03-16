import * as React from 'react'
import { Link } from 'react-router'
import { CagrCalculator } from '@/components/CagrCalculator'
import { FileUploader } from '@/components/ui/file-uploader'

export default function Cometa() {
  const [file, setFile] = React.useState<File | null>(null)

  return (
    <div className="bg-[--color-background] text-[--color-foreground]">
      <div className="mx-auto max-w-2xl px-6 py-12">

        <p className="mb-6 text-sm">
          📖 Prima volta? Leggi la{' '}
          <Link to="/cometa-guide">guida passo passo</Link>{' '}
          per sapere come esportare il file dal portale Fondo Cometa.
        </p>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Upload your file ☄️</h1>
          <p className="mt-2 text-sm text-[--color-muted-foreground]">
            Carica il file XLS esportato dal portale del fondo pensione.
          </p>
        </header>

        <FileUploader
          accept=".xls"
          onFileSelect={setFile}
          className={file ? 'py-6' : undefined}
        />

        {file && <CagrCalculator file={file} />}

      </div>
    </div>
  )
}
