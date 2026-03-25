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
      <div className="bg-primary text-on-primary">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <img src="/gennaro-logo.png" alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />
              <p className="text-[24px] leading-[32px] font-normal leading-tight">Gennaro</p>
            </div>
            <p className="text-[14px] leading-[20px] tracking-[0.25px] opacity-80 mt-0.5">Il detective del tuo fondo pensione</p>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden shrink-0 p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary"
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

      {/* Desktop tab navigation — M3 Primary Tabs pattern */}
      <nav className="hidden md:block bg-surface elevation-2">
        <div className="mx-auto flex max-w-4xl px-6 overflow-x-auto overflow-y-hidden">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative h-12 px-4 flex items-center text-[14px] leading-[20px] tracking-[0.1px] font-medium transition-colors no-underline whitespace-nowrap shrink-0',
                  'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:transition-colors after:duration-200',
                  isActive
                    ? 'text-primary after:bg-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/8 after:bg-transparent'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile dropdown — M3 Navigation Drawer pattern */}
      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden bg-surface elevation-2"
        >
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center h-14 px-6 text-[14px] leading-[20px] tracking-[0.1px] font-medium no-underline transition-colors',
                  isActive
                    ? 'text-on-secondary-container bg-secondary-container'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-on-surface/8'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
