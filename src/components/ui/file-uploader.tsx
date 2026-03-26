import * as React from 'react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  accept?: string
  initialFile?: File | null
  onFileSelect?: (file: File) => void
  onClear?: () => void
  className?: string
}

export function FileUploader({ accept, initialFile, onFileSelect, onClear, className }: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(initialFile ?? null)

  React.useEffect(() => {
    if (initialFile) setSelectedFile(initialFile)
  }, [initialFile])

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

  function handleClear(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation()
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ''
    onClear?.()
  }

  const labelId = React.useId()

  return (
    <div
      role="button"
      tabIndex={0}
      aria-labelledby={labelId}
      aria-describedby={accept ? `${labelId}-hint` : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted px-6 py-10 text-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        dragging && 'border-foreground bg-muted/80',
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
          <div>
            <p id={labelId} className="text-base font-bold">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <p className="text-sm text-muted-foreground">Premi Invio o clicca per sostituire</p>
          <button
            type="button"
            aria-label="Rimuovi file"
            onClick={handleClear}
            onKeyDown={(e: React.KeyboardEvent) => handleClear(e)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white text-xs hover:bg-foreground/80 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ✕
          </button>
        </>
      ) : (
        <>
          <div>
            <p id={labelId} className="text-base font-bold">Trascina qui il file o clicca per sfogliare</p>
            <p className="text-sm text-muted-foreground">oppure premi Invio per aprire il selettore</p>
          </div>
          {accept && (
            <p id={`${labelId}-hint`} className="text-sm text-muted-foreground">{accept}</p>
          )}
        </>
      )}
    </div>
  )
}
