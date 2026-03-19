import * as React from 'react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'gennaro_disclaimer_accepted'

export function DisclaimerModal() {
  const [visible, setVisible] = React.useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'true'
    } catch {
      return true
    }
  })

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-body"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 print:hidden"
    >
      <div className="w-full max-w-lg border-2 border-[#0b0c0c] bg-white">
        {/* Header */}
        <div className="bg-[#0b0c0c] px-6 py-4">
          <p id="disclaimer-title" className="text-lg font-bold text-white">
            Avviso importante
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">
          <div className="border-l-4 border-[#d4351c] bg-[#fde8e6] px-4 py-3 text-sm leading-relaxed">
            <p id="disclaimer-body">
              Qualsiasi contenuto di questo sito non è da intendersi come una consulenza
              finanziaria o un consiglio d'investimento, pertanto vi invito a fare le
              vostre dovute riflessioni prima di prendere qualsiasi decisione.
            </p>
          </div>

          <Button onClick={accept} className="self-end">
            Ho preso visione
          </Button>
        </div>
      </div>
    </div>
  )
}
