import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full border-2 border-[#0b0c0c] bg-white px-3 py-2 text-base text-[#0b0c0c] placeholder:text-[#505a5f] focus-visible:outline-3 focus-visible:outline-[#ffdd00] focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
