import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DemoSubmitButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * A styled submit button specifically for demo mode
 * Uses shadcn Button with custom demo-mode styling (purple accent)
 */
export const DemoSubmitButton: React.FC<DemoSubmitButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  children,
  className,
}) => {
  const isDisabled = disabled || loading

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      type="button"
      className={cn(
        'w-full h-12 px-6',
        'text-sm font-semibold uppercase tracking-wide',
        'rounded-lg border border-white/20',
        'bg-violet-500/80 hover:bg-violet-500 text-white',
        'transition-all duration-200',
        'hover:-translate-y-0.5 active:translate-y-0',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        // Loading shimmer effect
        loading && 'relative overflow-hidden',
        className
      )}
    >
      {loading && (
        <span
          className="absolute inset-0 animate-[shimmer_2s_infinite]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          }}
        />
      )}
      <span className="relative z-10">
        {loading ? 'PROCESSING...' : children || 'PLAY DEMO'}
      </span>
    </Button>
  )
}

export default DemoSubmitButton
