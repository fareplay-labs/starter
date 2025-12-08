import React from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface ThemedSliderProps {
  min: number
  max: number
  value: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  incrementAmount?: number

  // Theme properties (simplified for Tailwind)
  accentColor?: string
  trackGradient?: string
  fillColor?: string
  className?: string
}

/**
 * Themed slider using shadcn Slider component
 * Supports custom accent colors via CSS variables or inline styles
 */
export const ThemedSlider: React.FC<ThemedSliderProps> = ({
  min,
  max,
  value,
  step = 1,
  onChange,
  disabled = false,
  incrementAmount,
  accentColor,
  trackGradient,
  fillColor,
  className,
}) => {
  const effectiveStep = incrementAmount || step

  const validateAndClampValue = (val: number): number => {
    if (isNaN(val)) return min
    if (val < min) return min
    if (val > max) return max
    if (effectiveStep) {
      const steps = Math.round((val - min) / effectiveStep)
      return min + steps * effectiveStep
    }
    return val
  }

  const handleValueChange = (values: number[]) => {
    const newValue = values[0]
    if (!isNaN(newValue)) {
      const validatedValue = validateAndClampValue(newValue)
      onChange(validatedValue)
    }
  }

  const validatedValue = validateAndClampValue(value)

  // Custom styles for accent color
  const sliderStyle: React.CSSProperties = {}
  if (accentColor || fillColor) {
    sliderStyle['--slider-accent'] = fillColor || accentColor
  }
  if (trackGradient) {
    sliderStyle['--slider-track'] = trackGradient
  }

  return (
    <div
      className={cn(
        'relative w-full py-2',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      style={sliderStyle as React.CSSProperties}
    >
      <Slider
        value={[validatedValue]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={effectiveStep}
        disabled={disabled}
        className={cn(
          '[&_[data-slot=track]]:h-1 [&_[data-slot=track]]:bg-border',
          trackGradient && '[&_[data-slot=track]]:bg-[var(--slider-track)]',
          '[&_[data-slot=range]]:bg-[var(--slider-accent,hsl(var(--secondary)))]',
          '[&_[data-slot=thumb]]:h-3 [&_[data-slot=thumb]]:w-3',
          '[&_[data-slot=thumb]]:bg-[var(--slider-accent,hsl(var(--secondary)))]',
          '[&_[data-slot=thumb]]:border-2 [&_[data-slot=thumb]]:border-white',
          '[&_[data-slot=thumb]]:hover:bg-[var(--slider-accent,hsl(var(--secondary)))]',
          '[&_[data-slot=thumb]]:focus-visible:ring-2 [&_[data-slot=thumb]]:focus-visible:ring-offset-2'
        )}
      />
    </div>
  )
}

export default ThemedSlider
