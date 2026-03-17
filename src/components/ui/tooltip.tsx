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
      >
        {children}
      </span>

      {visible && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-[--radius] border border-neutral-200 bg-white text-neutral-900 px-3 py-2 text-xs leading-relaxed shadow-md pointer-events-none"
        >
          {content}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  )
}
