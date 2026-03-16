import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

const links = [
  { to: '/cometa', label: 'Cometa', emoji: '☄️' },
]

export function Nav() {
  return (
    <nav className="border-b border-[--color-border] bg-[--color-card]">
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-6 py-3">
        <span className="mr-4 text-sm font-semibold tracking-tight">🗂️ Fund</span>
        {links.map(({ to, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'rounded-[--radius] px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-black text-white'
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
