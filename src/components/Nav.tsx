import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

const links = [
  { to: '/',                   label: 'Missione'          },
  { to: '/rendimento-fondo',   label: 'Rendimento'        },
  { to: '/fp-vs-tfr',          label: 'FP vs TFR'         },
  { to: '/anni-persi',         label: 'Anni persi'        },
  { to: '/obiettivo',          label: 'Come dovrei fare?' },
  { to: '/rischio-rendimento', label: 'Devo rischiare?'   },
]

export function Nav() {
  return (
    <header className="print:hidden">
      {/* Service name bar */}
      <div className="bg-[#0b0c0c] text-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/gennaro-logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            <p className="text-xl font-bold leading-tight">Gennaro</p>
          </div>
          <p className="text-sm text-[#b1b4b6] mt-0.5">Il detective del tuo fondo pensione</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b-2 border-[#0b0c0c] bg-white">
        <div className="mx-auto flex max-w-4xl px-6">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-4 py-3 text-sm font-bold transition-colors no-underline border-b-4 -mb-0.5',
                  isActive
                    ? 'border-[#0b0c0c] text-[#0b0c0c]'
                    : 'border-transparent text-[#505a5f] hover:text-[#0b0c0c] hover:border-[#b1b4b6]'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
