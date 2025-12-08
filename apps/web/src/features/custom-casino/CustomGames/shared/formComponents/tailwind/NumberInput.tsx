import React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  disabled?: boolean
  incrementAmount?: number
  className?: string
}

/**
 * A styled number input field using shadcn Input
 * Handles validation and clamping of values
 */
export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  disabled = false,
  incrementAmount,
  className,
}) => {
  const validateAndClampValue = (val: number): number => {
    if (isNaN(val)) return 0
    if (min !== undefined && val < min) return min
    if (max !== undefined && val > max) return max
    return val
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow empty input for better UX while typing
    if (inputValue === '') {
      onChange(0)
      return
    }

    const newValue = parseFloat(inputValue)
    if (!isNaN(newValue)) {
      const validatedValue = validateAndClampValue(newValue)
      onChange(validatedValue)
    }
  }

  const handleBlur = () => {
    // On blur, ensure the displayed value is valid and within bounds
    const validatedValue = validateAndClampValue(value)
    if (validatedValue !== value) {
      onChange(validatedValue)
    }
  }

  const effectiveStep = incrementAmount || step

  return (
    <div className={cn('flex gap-1.5 w-full', className)}>
      <Input
        type="number"
        min={min}
        max={max}
        step={effectiveStep}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 bg-surface-raised border-border-subtle',
          'text-foreground text-sm',
          'focus:border-secondary focus:ring-secondary/50',
          '[appearance:textfield]',
          '[&::-webkit-outer-spin-button]:appearance-none',
          '[&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
    </div>
  )
}

export default NumberInput
