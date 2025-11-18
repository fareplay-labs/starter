// @ts-nocheck
import React from 'react'
import { SInput, SInputContainer } from './styled'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  disabled?: boolean
  incrementAmount?: number // Optional increment for both inputs
}

/**
 * A styled number input field with optional increment button
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
}) => {
  const validateAndClampValue = (value: number): number => {
    if (isNaN(value)) return 0
    if (min !== undefined && value < min) return min
    if (max !== undefined && value > max) return max
    return value
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
    <SInputContainer>
      <SInput
        type='number'
        min={min}
        max={max}
        step={effectiveStep}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
      />
    </SInputContainer>
  )
}
