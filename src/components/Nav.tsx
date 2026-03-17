import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

const links = [
  { to: '/cometa',   label: 'Cometa',   emoji: '☄️' },
  { to: '/fonte',    label: 'Fonte',    emoji: '🌊' },
  { to: '/missione', label: 'Missione', emoji: '🧭' },
]

export function Nav() {
  return (
    <nav className="border-b border-[--color-border] bg-[--color-card]">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-6 py-3">
{links.map(({ to, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'rounded-[--radius] px-3 py-1.5 text-sm font-medium transition-colors no-underline',
                isActive
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'text-[--color-muted-foreground] hover:bg-[--color-muted] hover:text-[--color-foreground]'
              )
            }
          >
            {emoji} {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
