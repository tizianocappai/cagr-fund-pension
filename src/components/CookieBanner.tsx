import * as React from 'react'
import { Link } from 'react-router'
import { Button } from 'antd'

const STORAGE_KEY = 'gennaro_cookie_consent'

interface Props {
  onConsent: (accepted: boolean) => void
}

export function CookieBanner({ onConsent }: Props) {
  const [visible, setVisible] = React.useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === null } catch { return true }
  })

  function respond(choice: 'accepted' | 'rejected') {
    try { localStorage.setItem(STORAGE_KEY, choice) } catch {}
    setVisible(false)
    onConsent(choice === 'accepted')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline bg-surface-container-low px-6 py-4 print:hidden">
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-[14px] leading-[20px] tracking-[0.25px] flex-1 leading-relaxed">
          Questo sito utilizza <strong>Vercel Analytics</strong> (statistiche aggregate anonime sulle visite) e un widget
          esterno <strong>Buy Me a Coffee</strong>. Nessun dato finanziario viene trasmesso.
          {' '}<Link to="/privacy" className="whitespace-nowrap">Privacy Policy</Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button type="default" size="small" onClick={() => respond('rejected')}>Rifiuta</Button>
          <Button type="primary" size="small" onClick={() => respond('accepted')}>Accetta</Button>
        </div>
      </div>
    </div>
  )
}
