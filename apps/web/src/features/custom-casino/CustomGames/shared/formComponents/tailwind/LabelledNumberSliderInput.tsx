import React from 'react'
import { FormGroup } from './FormGroup'
import { NumberInput } from './NumberInput'
import { ThemedSlider } from './ThemedSlider'

interface LabelledNumberSliderInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  numberInputMax?: number
  sliderMax?: number
  incrementAmount?: number
  accentColor?: string
  disabled?: boolean
  className?: string
}

/**
 * Combined number input + slider with label
 * Provides both precise input and drag-to-adjust functionality
 */
export const LabelledNumberSliderInput: React.FC<LabelledNumberSliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  numberInputMax,
  sliderMax,
  incrementAmount,
  accentColor,
  disabled = false,
  className,
}) => {
  const effectiveNumberInputMax = numberInputMax ?? max
  const effectiveSliderMax = sliderMax ?? max ?? 100

  return (
    <FormGroup label={label} className={className}>
      <NumberInput
        value={value}
        onChange={onChange}
        min={min}
        max={effectiveNumberInputMax}
        incrementAmount={incrementAmount}
        step={incrementAmount}
        disabled={disabled}
      />
      <ThemedSlider
        value={value}
        onChange={onChange}
        min={min}
        max={effectiveSliderMax}
        fillColor={accentColor}
        accentColor={accentColor}
        step={incrementAmount}
        incrementAmount={incrementAmount}
        disabled={disabled}
      />
    </FormGroup>
  )
}

export default LabelledNumberSliderInput
