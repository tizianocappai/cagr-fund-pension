import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const id = React.useId()

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      <span
        role="button"
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVisible(v => !v) }
          if (e.key === 'Escape') setVisible(false)
        }}
      >
        {children}
      </span>

      {visible && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 border-2 border-[#0b0c0c] bg-white text-[#0b0c0c] px-4 py-3 text-sm leading-relaxed shadow-md pointer-events-none"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b0c0c]" />
        </span>
      )}
    </span>
  )
}
