// @ts-nocheck
import { styled } from 'styled-components'
import { BREAKPOINTS, CHIP_COLORS } from '@/design'

export const BetFormWrapper = styled.div<{ $isDisabled: boolean; $isOpen: boolean }>`
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 656px;
  margin: 0 auto;
  opacity: ${props => (props.$isDisabled ? 0.8 : 1)};
  pointer-events: ${props => (props.$isDisabled ? 'none' : 'auto')};
  transition: opacity 0.2s ease;

  @media (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    max-width: 100%;
    overflow: scroll;
  }
`

export const TopSection = styled.div`
  display: flex;
  height: 70%;

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    align-items: center;
    justify-content: center;
    width: 99%;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    align-items: center;
    justify-content: center;
    width: 100%;
    height: auto;
  }
`

export const LeftButton = styled.button<{
  $neutralColor?: string
  $textColor?: string
  $borderColor?: string
}>`
  width: calc(100% / 14);
  aspect-ratio: 1/3;
  background: ${props => props.$neutralColor || '#4caf4f92'};
  border: 1px solid ${props => props.$borderColor || props.$neutralColor || '#4caf50'};
  border-radius: 4px;
  color: ${props => props.$textColor || 'white'};
`

export const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0px;
  flex: 1;
  position: relative;
`

export const RightColumn = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  width: calc(100% / 14);
`

export const NumberButton = styled.button<{
  $isRed?: boolean
  $rouletteColor1?: string
  $rouletteColor2?: string
  $textColor?: string
  $borderColor1?: string
  $borderColor2?: string
}>`
  width: 100%;
  aspect-ratio: 1;
  background: ${props => {
    if (props.$isRed) {
      return props.$rouletteColor1 || '#ff1a1aa4'
    }
    return props.$rouletteColor2 || '#1a1a1aa7'
  }};
  border: 1px solid
    ${props => {
      if (props.$isRed) {
        return props.$borderColor1 || props.$rouletteColor1 || '#ff1a1a'
      }
      return props.$borderColor2 || props.$rouletteColor2 || '#383838'
    }};
  border-radius: 4px;
  color: ${props => props.$textColor || 'white'};
  padding: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`

export const MiddleSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin-left: calc(100% / 14);
  width: calc((100% / 14) * 12);
  aspect-ratio: 12/1;
`

export const BottomSection = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
  margin-left: calc(100% / 14);
  width: calc((100% / 14) * 12);
  aspect-ratio: 12/1;
`

export const SectionButton = styled(NumberButton)`
  width: 100%;
  height: 100%;
  aspect-ratio: auto;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`

export const ChipOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

export const ChipWrapper = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  width: 28px;
  aspect-ratio: 1;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

export const ChipCircle = styled.div<{ $isHover?: boolean; $value: number; $minBetAmount: number }>`
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: ${props => {
    const multiplier = props.$value / props.$minBetAmount
    if (props.$isHover) return CHIP_COLORS.hover
    if (multiplier < 5) return CHIP_COLORS.one
    if (multiplier < 25) return CHIP_COLORS.five
    if (multiplier < 100) return CHIP_COLORS.twentyFive
    return CHIP_COLORS.hundred
  }};
  border: ${props => {
    if (props.$value === props.$minBetAmount) {
      return '2px dashed blue'
    }
    return props.$isHover ? '2px dashed #ffffff44' : '2px dashed white'
  }};

  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
    if (props.$value === props.$minBetAmount) {
      return props.$isHover ? '#ffffff88' : 'blue'
    }
    return props.$isHover ? '#ffffff88' : '#ffffffdd'
  }};

  user-select: none;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);

  /* Add inner ring */
  &::after {
    content: '';
    position: absolute;
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: ${props => {
      if (props.$value === props.$minBetAmount) {
        return props.$isHover ? '2px dashed #ffffff44' : '2px dashed blue'
      }
      return props.$isHover ? '2px dashed #ffffff44' : '2px dashed white'
    }};
  }
`
