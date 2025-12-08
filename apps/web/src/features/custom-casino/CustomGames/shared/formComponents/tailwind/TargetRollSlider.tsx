import React from 'react'
import { cn } from '@/lib/utils'
import { FormGroup } from './FormGroup'
import { ThemedSlider } from './ThemedSlider'

interface TargetRollSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  accentColor?: string
  textColor?: string
  className?: string
}

/**
 * Specialized slider for dice target roll selection
 * Shows LOSE/WIN labels and uses red-to-green gradient track
 */
export const TargetRollSlider: React.FC<TargetRollSliderProps> = ({
  value,
  onChange,
  min = 5,
  max = 95,
  step = 1,
  accentColor,
  className,
}) => {
  return (
    <FormGroup label="Target Roll" className={className}>
      {/* LOSE/WIN header */}
      <div className="flex justify-between px-1 text-sm font-bold mb-1">
        <span className="text-warning">LOSE</span>
        <span className="text-success-soft">WIN</span>
      </div>

      {/* Slider with gradient track */}
      <ThemedSlider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        trackGradient="linear-gradient(to right, #f44336 0%, #4caf50 100%)"
        accentColor={accentColor}
      />
    </FormGroup>
  )
}

export default TargetRollSlider
