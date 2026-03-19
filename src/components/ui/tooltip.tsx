import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Controls horizontal alignment of the tooltip bubble. Default: 'center'. */
  placement?: 'center' | 'start' | 'end'
}

export function Tooltip({ content, children, className, placement = 'center' }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const id = React.useId()

  const bubblePos =
    placement === 'start'
      ? 'left-0'
      : placement === 'end'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2'

  const arrowPos =
    placement === 'start'
      ? 'left-4'
      : placement === 'end'
        ? 'right-4'
        : 'left-1/2 -translate-x-1/2'

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
          className={cn(
            'absolute bottom-full mb-2 z-50 w-72 border-2 border-[#0b0c0c] bg-white text-[#0b0c0c] px-4 py-3 text-sm leading-relaxed shadow-md pointer-events-none',
            bubblePos,
          )}
        >
          {content}
          <span className={cn('absolute top-full border-4 border-transparent border-t-[#0b0c0c]', arrowPos)} />
        </span>
      )}
    </span>
  )
}
