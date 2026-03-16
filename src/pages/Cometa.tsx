import * as React from 'react'
import { CagrCalculator } from '@/components/CagrCalculator'
import { FileUploader } from '@/components/ui/file-uploader'

export default function Cometa() {
  const [file, setFile] = React.useState<File | null>(null)

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground]">
      <div className="mx-auto max-w-2xl px-6 py-12">

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
