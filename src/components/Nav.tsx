import * as React from 'react'
import { NavLink, useLocation } from 'react-router'
import { cn } from '@/lib/utils'

const links = [
  { to: '/',                   label: 'Missione'          },
  { to: '/rendimento-fondo',   label: 'Rendimento'        },
  { to: '/fp-vs-tfr',          label: 'FP vs TFR'         },
  { to: '/anni-persi',         label: 'Anni persi'        },
  { to: '/obiettivo',          label: 'Come dovrei fare?' },
  { to: '/rischio-rendimento', label: 'Devo rischiare?'   },
  { to: '/alternative',        label: 'E Tu Fumi?'        },
]

export function Nav() {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()

  React.useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <header className="print:hidden">
      {/* Service name bar */}
      <div className="bg-[#0b0c0c] text-white">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <img src="/gennaro-logo.png" alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />
              <p className="text-xl font-bold leading-tight">Gennaro</p>
            </div>
            <p className="text-sm text-border mt-0.5">Il detective del tuo fondo pensione</p>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden shrink-0 p-2 -mr-2 focus-visible:outline-3 focus-visible:outline-[#ffdd00]"
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(v => !v)}
          >
            <span className="sr-only">{open ? 'Chiudi menu' : 'Apri menu'}</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {open ? (
                <path strokeLinecap="square" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeLinecap="square" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop tab navigation — hidden below md */}
      <nav className="hidden md:block border-b-2 border-[#0b0c0c] bg-white">
        <div className="mx-auto flex max-w-4xl px-6 overflow-x-auto overflow-y-hidden">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-4 py-3 text-sm font-bold transition-colors no-underline border-b-4 -mb-0.5 whitespace-nowrap shrink-0',
                  isActive
                    ? 'border-[#0b0c0c] text-[#0b0c0c]'
                    : 'border-transparent text-muted-foreground hover:text-[#0b0c0c] hover:border-border'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile dropdown — shown when open, below md breakpoint */}
      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden bg-white border-b-2 border-[#0b0c0c]"
        >
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex px-6 py-4 text-sm font-bold no-underline border-l-4 transition-colors',
                  isActive
                    ? 'border-[#0b0c0c] text-[#0b0c0c] bg-muted'
                    : 'border-transparent text-muted-foreground hover:text-[#0b0c0c] hover:bg-muted'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Border shown on mobile when menu is closed */}
      {!open && <div className="md:hidden border-b-2 border-[#0b0c0c]" />}
    </header>
  )
}
