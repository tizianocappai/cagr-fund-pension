import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-bold transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-[#ffdd00] focus-visible:outline-offset-0',
  {
    variants: {
      variant: {
        default: 'bg-[#00703c] text-white hover:bg-[#005a30] shadow-[0_2px_0_#002d18]',
        secondary: 'bg-[#f3f2f1] text-[#0b0c0c] border border-[#b1b4b6] hover:bg-[#dbdad9] shadow-[0_2px_0_#929191]',
        warning: 'bg-[#d4351c] text-white hover:bg-[#aa2a16] shadow-[0_2px_0_#55150e]',
      },
      size: {
        default: 'px-4 py-2',
        sm:      'px-3 py-1.5 text-sm',
        lg:      'px-6 py-3',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
