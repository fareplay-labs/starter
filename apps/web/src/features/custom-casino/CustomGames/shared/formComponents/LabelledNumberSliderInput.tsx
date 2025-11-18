// @ts-nocheck
import React from 'react'
import { FormGroup, NumberInput, ThemedSlider } from '.'

interface LabelledNumberSliderInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  numberInputMax?: number // Optional separate max for NumberInput if needed
  sliderMax?: number // Optional separate max for Slider if needed
  incrementAmount?: number // Optional increment for both inputs
  accentColor?: string
  disabled?: boolean
}

export const LabelledNumberSliderInput: React.FC<LabelledNumberSliderInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max, // If not provided, slider/number input might need their own
  numberInputMax,
  sliderMax,
  incrementAmount,
  accentColor,
  disabled = false,
}) => {
  const effectiveNumberInputMax = numberInputMax ?? max
  const effectiveSliderMax = sliderMax ?? max ?? 100 // Default slider max if no max/sliderMax

  return (
    <FormGroup label={label}>
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
        thumbColor={accentColor}
        thumbHoverColor='#7f7fff'
        thumbActiveColor='#4f4fff'
        step={incrementAmount}
        incrementAmount={incrementAmount}
        disabled={disabled}
      />
    </FormGroup>
  )
}
