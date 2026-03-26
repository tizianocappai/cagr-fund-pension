import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const STORAGE_KEY = 'gennaro_disclaimer_accepted'

export function DisclaimerModal() {
  const [open, setOpen] = React.useState(() => {
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
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg print:hidden">
        <DialogHeader>
          <DialogTitle>Avviso importante</DialogTitle>
          <DialogDescription className="sr-only">
            Disclaimer sui contenuti del sito
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertDescription className="leading-relaxed">
            Qualsiasi contenuto di questo sito non è da intendersi come una consulenza
            finanziaria o un consiglio d'investimento, pertanto vi invito a fare le
            vostre dovute riflessioni prima di prendere qualsiasi decisione.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button onClick={accept}>
            Ho preso visione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
