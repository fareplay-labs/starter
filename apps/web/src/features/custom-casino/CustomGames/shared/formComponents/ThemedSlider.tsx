// @ts-nocheck
import React, { useEffect } from 'react'
import { SFill, SSliderContainer, STrack, StyledInput } from './styled'

interface ThemedSliderProps {
  min: number
  max: number
  value: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  incrementAmount?: number // Optional prop to show increment button

  // Theme properties
  trackColor?: string
  trackGradient?: string
  thumbColor?: string
  thumbHoverColor?: string
  thumbActiveColor?: string
  fillColor?: string
  height?: number
  trackHeight?: number
  thumbSize?: number
  thumbBorderColor?: string
}

export const ThemedSlider: React.FC<ThemedSliderProps> = ({
  min,
  max,
  value,
  step = 1,
  onChange,
  disabled = false,
  incrementAmount,

  // Theme defaults
  trackColor = '#1b1d26',
  trackGradient,
  thumbColor = '#5f5fff',
  thumbHoverColor = '#7f7fff',
  thumbActiveColor = '#4f4fff',
  fillColor = '#5f5fff',
  height = 24,
  trackHeight = 4,
  thumbSize = 12,
  thumbBorderColor = '#ffffff',
}) => {
  const effectiveStep = incrementAmount || step

  const validateAndClampValue = (value: number): number => {
    if (isNaN(value)) return min
    if (value < min) return min
    if (value > max) return max
    // Round to the nearest step if needed
    if (effectiveStep) {
      const steps = Math.round((value - min) / effectiveStep)
      return min + steps * effectiveStep
    }
    return value
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      const validatedValue = validateAndClampValue(newValue)
      onChange(validatedValue)
    }
  }

  const validatedValue = validateAndClampValue(value)
  const percentage = ((validatedValue - min) / (max - min)) * 100

  return (
    <SSliderContainer $height={height} $disabled={disabled}>
      {trackGradient ?
        <STrack $height={trackHeight} $gradient={trackGradient} />
      : <STrack $height={trackHeight} $color={trackColor}>
          <SFill $percentage={percentage} $color={fillColor} />
        </STrack>
      }

      <StyledInput
        type='range'
        min={min}
        max={max}
        step={effectiveStep}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        $thumbSize={thumbSize}
        $thumbColor={thumbColor}
        $thumbHoverColor={thumbHoverColor}
        $thumbActiveColor={thumbActiveColor}
        $thumbBorderColor={thumbBorderColor}
        $trackHeight={trackHeight}
      />
    </SSliderContainer>
  )
}
