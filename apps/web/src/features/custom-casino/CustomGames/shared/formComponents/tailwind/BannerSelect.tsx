import React from 'react'
import { cn } from '@/lib/utils'

type BannerOptionId = string | number

export interface BannerOption {
  id: BannerOptionId
  title: React.ReactNode
  details?: React.ReactNode
  accentColor?: string
}

interface BannerSelectProps {
  options: BannerOption[]
  selectedId: BannerOptionId | null | undefined
  onSelect: (id: BannerOptionId) => void
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

/**
 * Radio-button style banner selector
 * Supports custom accent colors per option
 */
export const BannerSelect: React.FC<BannerSelectProps> = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
  className,
  'data-testid': dataTestId,
}) => {
  return (
    <div
      className={cn('flex flex-col gap-2 w-full', className)}
      data-testid={dataTestId}
      role="radiogroup"
    >
      {options.map(option => {
        const isSelected = option.id === selectedId
        const accentColor = option.accentColor || 'hsl(var(--casino-aqua))'

        return (
          <button
            key={String(option.id)}
            type="button"
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            aria-checked={isSelected}
            role="radio"
            className={cn(
              'w-full flex justify-between items-center gap-3',
              'px-4 py-3.5 rounded-lg',
              'border-2 transition-all duration-200',
              'cursor-pointer',
              'hover:enabled:-translate-y-0.5',
              'active:enabled:translate-y-0',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              isSelected
                ? 'bg-surface-raised text-foreground'
                : 'bg-surface-raised border-border-subtle text-foreground hover:enabled:border-[var(--accent-color)]'
            )}
            style={{
              '--accent-color': accentColor,
              borderColor: isSelected ? accentColor : undefined,
              background: isSelected
                ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`
                : undefined,
            } as React.CSSProperties}
          >
            <div className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              {option.title}
            </div>
            {option.details && (
              <div className="text-xs text-muted-foreground ml-auto whitespace-nowrap overflow-hidden text-ellipsis">
                {option.details}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default BannerSelect
