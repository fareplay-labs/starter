// @ts-nocheck
import {
  BACKGROUND_COLORS,
  BORDER_COLORS,
  COLORS,
  FONT_STYLES,
  SPACING,
  TEXT_COLORS,
} from '@/design'
import { styled } from 'styled-components'

// Colors
const primaryColor = '#5f5fff'

// Spacing
const spacing = {
  xs: '3px',
  sm: '5px',
  md: '8px',
  lg: '12px',
}

// Border radius
const borderRadius = '6px'

// Transitions
const transition = 'all 0.2s ease'

export const SErrorDisplay = styled.div`
  color: ${COLORS.softError};
  ${FONT_STYLES.sm}
  margin: 0 0 ${spacing.sm};
  text-align: center;
`

export const SStatContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: ${spacing.sm};
  margin: ${spacing.sm} 0 ${spacing.md};
  width: 100%;
`

export const SStatCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${BACKGROUND_COLORS.two};
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: ${borderRadius};
  padding: ${spacing.sm};
`

export const SStatLabel = styled.div`
  color: ${TEXT_COLORS.two};
  ${FONT_STYLES.xs}
  margin-bottom: ${spacing.xs};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const SLabel = styled.div`
  color: ${TEXT_COLORS.two};
  ${FONT_STYLES.xs}
  margin-bottom: ${SPACING.xs}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const SStatValue = styled.div`
  color: ${TEXT_COLORS.one};
  ${FONT_STYLES.sm}
  text-align: center;
`

export const SInputContainer = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.sm};
  width: 100%;
`

export const SInput = styled.input`
  flex: 1;
  background-color: ${BACKGROUND_COLORS.two};
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: ${borderRadius};
  color: ${TEXT_COLORS.one};
  ${FONT_STYLES.sm}
  outline: none;
  padding: ${spacing.lg};

  &:focus {
    border-color: ${primaryColor};
  }

  &:disabled {
    border-color: ${BACKGROUND_COLORS.three};
    cursor: not-allowed;
    opacity: 0.5;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`

export const SSimulationButtonsContainer = styled.div`
  display: flex;
  gap: ${spacing.md};
  width: 100%;
`

export const SSimulationButton = styled.button<{ $type: 'win' | 'loss' }>`
  flex: 1;
  height: 40px;
  background-color: ${({ $type }) => ($type === 'win' ? COLORS.softSuccess : COLORS.error)};
  border: none;
  border-radius: ${borderRadius};
  color: ${TEXT_COLORS.one};
  cursor: pointer;
  ${FONT_STYLES.sm}
  font-weight: bold;

  &:hover {
    background-color: ${({ $type }) => ($type === 'win' ? '#45a049' : '#e53935')};
  }

  &:disabled {
    background-color: ${TEXT_COLORS.three};
    cursor: not-allowed;
  }
`

export const SFormLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: ${spacing.lg};
  user-select: none;
`

export const SButton = styled.button<{ $accentColor: string }>`
  background-color: transparent;
  border: 1px solid ${props => props.$accentColor};
  border-radius: ${borderRadius};
  color: ${TEXT_COLORS.one};
  cursor: pointer;
  ${FONT_STYLES.sm}
  font-weight: bold;
  letter-spacing: 0.5px;
  margin-top: auto;
  margin-bottom: 10px;
  padding: ${spacing.lg};
  text-transform: uppercase;
  transition: ${transition};
  width: 100%;

  &:hover:not(:disabled) {
    background-color: ${props => `${props.$accentColor}15`};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    border-color: ${BACKGROUND_COLORS.three};
    color: ${TEXT_COLORS.two};
    cursor: not-allowed;
  }
`

export const SSliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 ${spacing.sm};
  ${FONT_STYLES.sm}
  font-weight: bold;
  margin-bottom: ${spacing.sm};
`

export const SLoseLabel = styled.span`
  color: ${COLORS.warning};
`

export const SWinLabel = styled.span`
  color: ${COLORS.softSuccess};
`

export const SSliderContainer = styled.div<{
  $height: number
  $disabled?: boolean
}>`
  position: relative;
  width: 100%;
  height: ${props => props.$height}px;
  display: flex;
  align-items: center;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${props => (props.$disabled ? 'none' : 'auto')};
`

export const STrack = styled.div<{
  $height: number
  $color?: string
  $gradient?: string
}>`
  position: absolute;
  width: 100%;
  height: ${props => props.$height}px;
  background: ${props => props.$gradient || props.$color};
  border-radius: ${props => props.$height / 2}px;
  z-index: 0;
`

export const SFill = styled.div<{
  $percentage: number
  $color: string
}>`
  position: absolute;
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: ${props => props.$color};
  border-radius: inherit;
`

export const StyledInput = styled.input<{
  $thumbSize: number
  $thumbColor: string
  $thumbHoverColor: string
  $thumbActiveColor: string
  $thumbBorderColor: string
  $trackHeight: number
}>`
  position: absolute;
  width: 100%;
  margin: 0;
  background: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  z-index: 2;
  height: 100%;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  /* Thumb styling */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: ${props => props.$thumbSize}px;
    height: ${props => props.$thumbSize}px;
    border-radius: ${props => props.$thumbSize / 4}px;
    background: ${props => props.$thumbColor};
    border: 1px solid ${props => props.$thumbBorderColor};
    cursor: pointer;
    margin-top: ${props => -((props.$thumbSize - props.$trackHeight) / 2)}px;
    transition: background 0.2s;
  }

  &::-moz-range-thumb {
    width: ${props => props.$thumbSize}px;
    height: ${props => props.$thumbSize}px;
    border-radius: ${props => props.$thumbSize / 4}px;
    background: ${props => props.$thumbColor};
    border: 1px solid ${props => props.$thumbBorderColor};
    cursor: pointer;
    transition: background 0.2s;
  }

  /* Hover state */
  &:hover::-webkit-slider-thumb {
    background: ${props => props.$thumbHoverColor};
  }

  &:hover::-moz-range-thumb {
    background: ${props => props.$thumbHoverColor};
  }

  /* Active state */
  &:active::-webkit-slider-thumb {
    background: ${props => props.$thumbActiveColor};
  }

  &:active::-moz-range-thumb {
    background: ${props => props.$thumbActiveColor};
  }

  /* Track styling - hide default */
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: ${props => props.$trackHeight}px;
    background: transparent;
    border-radius: ${props => props.$trackHeight / 2}px;
    cursor: pointer;
  }

  &::-moz-range-track {
    width: 100%;
    height: ${props => props.$trackHeight}px;
    background: transparent;
    border-radius: ${props => props.$trackHeight / 2}px;
    cursor: pointer;
  }
`

export const SChoicesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 5px;
  margin-bottom: 3px;
  width: 100%;
`

export const SChoiceButton = styled.button<{
  $selected: boolean
  $primaryColor: string
  $disabled?: boolean
}>`
  flex: 1;
  padding: ${spacing.sm};
  border: 2px solid
    ${({ $selected, $primaryColor }) => ($selected ? $primaryColor : BORDER_COLORS.one)};
  background: ${({ $selected, $primaryColor }) =>
    $selected ? $primaryColor + '33' : 'transparent'};
  color: ${TEXT_COLORS.one};
  border-radius: ${borderRadius};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-weight: ${({ $selected }) => ($selected ? 'bold' : 'normal')};
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  transition: ${transition};
  opacity: ${props => (props.disabled ? 0.5 : 1)};

  &:hover {
    background: ${({ $primaryColor }) => $primaryColor + '22'};
  }
`

export const SChoiceIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
  }
`

export const SChoiceLabel = styled.div`
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
  }
`
