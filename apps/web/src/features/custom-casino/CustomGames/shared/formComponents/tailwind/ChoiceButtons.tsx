import React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface ChoiceOption<T> {
  value: T
  label?: string
  icon?: string
  iconAlt?: string
}

interface ChoiceButtonsProps<T> {
  label?: string
  options: ChoiceOption<T>[]
  selected: T | null
  onSelect: (value: T) => void
  disabled?: boolean
  accentColor?: string
  className?: string
}

/**
 * Reusable choice selector with icon or label support
 * Used for game selections like RPS (rock/paper/scissors), risk levels, etc.
 */
export function ChoiceButtons<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
  disabled = false,
  accentColor,
  className,
}: ChoiceButtonsProps<T>) {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
          {label}
        </Label>
      )}
      <div className="flex justify-between gap-1.5 w-full">
        {options.map(option => {
          const isSelected = selected === option.value

          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={cn(
                'flex-1 p-1.5 rounded-md border-2 transition-all duration-200',
                'flex justify-center items-center min-w-0 overflow-hidden',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'font-bold'
                  : 'border-border-subtle bg-transparent hover:bg-white/5'
              )}
              style={{
                borderColor: isSelected ? (accentColor || 'hsl(var(--secondary))') : undefined,
                background: isSelected ? `${accentColor || 'hsl(var(--secondary))'}33` : undefined,
              }}
            >
              {option.icon ? (
                <img
                  src={option.icon}
                  alt={option.iconAlt || option.label || String(option.value)}
                  className="w-[30px] h-[30px] object-contain max-[480px]:w-6 max-[480px]:h-6"
                />
              ) : (
                <span className="w-[30px] h-[30px] flex justify-center items-center text-foreground max-[480px]:w-6 max-[480px]:h-6">
                  {option.label || String(option.value)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ChoiceButtons
