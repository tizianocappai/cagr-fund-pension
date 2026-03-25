import * as React from 'react'
import { Alert, Button } from 'antd'

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
      <div className="w-full max-w-lg bg-surface-container elevation-3 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4">
          <p id="disclaimer-title" className="text-[22px] leading-[28px] font-medium text-white">
            Avviso importante
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">
          <Alert
            type="error"
            showIcon
            description={
              <p id="disclaimer-body">
                Qualsiasi contenuto di questo sito non è da intendersi come una consulenza
                finanziaria o un consiglio d'investimento, pertanto vi invito a fare le
                vostre dovute riflessioni prima di prendere qualsiasi decisione.
              </p>
            }
          />

          <Button type="primary" onClick={accept} className="self-end">
            Ho preso visione
          </Button>
        </div>
      </div>
    </div>
  )
}
