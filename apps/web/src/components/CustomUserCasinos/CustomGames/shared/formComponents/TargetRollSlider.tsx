// @ts-nocheck
import React from 'react'
import { FormGroup, ThemedSlider } from '.'
import { SLoseLabel, SSliderHeader, SWinLabel } from './styled'

interface TargetRollSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  accentColor?: string
  textColor?: string
}

export const TargetRollSlider: React.FC<TargetRollSliderProps> = ({
  value,
  onChange,
  min = 5,
  max = 95,
  step = 1,
  accentColor,
  textColor,
}) => {
  return (
    <FormGroup label='Target Roll'>
      <SSliderHeader>
        <SLoseLabel>LOSE</SLoseLabel>
        <SWinLabel>WIN</SWinLabel>
      </SSliderHeader>
      <ThemedSlider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        trackGradient='linear-gradient(to right, #f44336 0%, #4caf50 100%)'
        thumbColor={accentColor}
        thumbHoverColor='#7f7fff'
        thumbActiveColor='#4f4fff'
        thumbBorderColor={textColor}
      />
    </FormGroup>
  )
}
