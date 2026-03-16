import * as React from 'react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  accept?: string
  onFileSelect?: (file: File) => void
  className?: string
}

export function FileUploader({ accept, onFileSelect, className }: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  function handleFile(file: File) {
    setSelectedFile(file)
    onFileSelect?.(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const labelId = React.useId()

  return (
    <div
      role="button"
      tabIndex={0}
      aria-labelledby={labelId}
      aria-describedby={accept ? `${labelId}-hint` : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-[--radius] border border-dashed border-[--color-border] bg-[--color-muted] px-6 py-12 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        dragging && 'border-black bg-[--color-secondary]',
        className
      )}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={handleChange}
      />

      {selectedFile ? (
        <>
          <span className="text-3xl" aria-hidden="true">📄</span>
          <div>
            <p id={labelId} className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-[--color-muted-foreground]">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <p className="text-xs text-[--color-muted-foreground]">Premi Invio o clicca per sostituire</p>
        </>
      ) : (
        <>
          <span className="text-3xl" aria-hidden="true">📂</span>
          <div>
            <p id={labelId} className="text-sm font-medium">Trascina qui il file o clicca per sfogliare</p>
            <p className="text-xs text-[--color-muted-foreground]">oppure premi Invio per aprire il selettore</p>
          </div>
          {accept && (
            <p id={`${labelId}-hint`} className="text-xs text-[--color-muted-foreground]">{accept}</p>
          )}
        </>
      )}
    </div>
  )
}
