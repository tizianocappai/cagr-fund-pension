export function Footer() {
  return (
    <footer className="border-t border-[--color-border] bg-[--color-card]">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 px-6 py-4 text-center">
        <p className="text-xs text-[--color-muted-foreground]">
          🔒 Questo sito non memorizza, raccoglie o trasmette alcun tipo di dato. Tutto il calcolo avviene localmente nel tuo browser.
        </p>
        <p className="text-xs text-[--color-muted-foreground]">
          Sviluppato da{' '}
          <a
            href="https://www.linkedin.com/in/tiziano-cappai-1b5271153/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[--color-foreground] underline underline-offset-2 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 rounded-sm"
          >
            Cappai Tiziano
          </a>
        </p>
      </div>
    </footer>
  )
}
