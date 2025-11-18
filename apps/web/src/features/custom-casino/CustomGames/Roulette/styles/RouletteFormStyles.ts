// @ts-nocheck
import { styled, css } from 'styled-components'
import { motion } from 'framer-motion'
import { CHIP_COLORS, FARE_COLORS, BORDER_COLORS, TEXT_COLORS, OUTCOME_COLORS } from '@/design'

// Typography
const fontSizeSm = '8px'
const fontSize = '10px'
const fontSizeLg = '12px'

// Colors
const darkColor = '#333'
const darkBgColor = 'rgba(0, 0, 0, 0.2)'

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
const transition = 'all 0.2s'

export const ChipSection = styled.div`
  margin: ${spacing.sm} 0;
  padding: ${spacing.md};
  border: 1px solid ${darkColor};
  border-radius: ${borderRadius};
`

export const ChipTitle = styled.h3<{ $textColor: string }>`
  color: ${props => props.$textColor};
  margin: 0 0 ${spacing.xs} 0;
  font-size: ${fontSize};
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const ChipButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md};
  margin-block: ${spacing.sm};
`

export const ChipButton = styled.button<{
  $isActive: boolean
  $value: number
  $minBetAmount: number
}>`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => {
    const multiplier = props.$value / props.$minBetAmount
    if (multiplier < 5) return `${CHIP_COLORS.one}${props.$isActive ? 'ff' : '99'}`
    else if (multiplier < 25) return `${CHIP_COLORS.five}${props.$isActive ? 'ff' : '99'}`
    else if (multiplier < 100) return `${CHIP_COLORS.twentyFive}${props.$isActive ? 'ff' : '99'}`
    return `${CHIP_COLORS.hundred}${props.$isActive ? 'ff' : '99'}`
  }};
  border: 2px solid ${props => (props.$isActive ? '#ffffff' : CHIP_COLORS.border.normal)};
  box-shadow: ${props =>
    props.$isActive ?
      '0 0 10px rgba(255, 255, 255, 0.5), inset 0 0 8px rgba(0, 0, 0, 0.5)'
    : 'inset 0 0 8px rgba(0, 0, 0, 0.5)'};
  color: ${CHIP_COLORS.text.normal};
  cursor: pointer;
  transition: ${transition};
  font-size: ${fontSize};
  font-weight: 600;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);

  &:first-child {
    color: ${FARE_COLORS.blue};
    &::before {
      content: '';
      position: absolute;
      width: 70%;
      height: 70%;
      border-radius: 50%;
      border: 1.5px dashed blue;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
  }

  &:not(:first-child)::before {
    content: '';
    position: absolute;
    width: 70%;
    height: 70%;
    border-radius: 50%;
    border: 1.5px dashed white;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    border: 1.5px solid ${CHIP_COLORS.border.faded};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #ffffff;
    opacity: 1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const CurrentEntriesSection = styled.div`
  padding: ${spacing.md};
  border: 1px solid ${darkColor};
  border-radius: ${borderRadius};
  margin: ${spacing.sm} 0;
  max-height: 120px;
  min-height: 80px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`

export const EntryListHeader = styled.div<{ $textColor: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xs};
  color: ${props => props.$textColor};
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  span {
    font-size: ${fontSize};
  }
`

export const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  overflow-y: auto;
  padding: 0 ${spacing.sm} ${spacing.xs} 0;
  margin-right: -${spacing.sm};
  height: 100%;
  mask-image: linear-gradient(to bottom, black calc(100% - ${spacing.xs}), transparent 100%);

  &::-webkit-scrollbar {
    width: ${spacing.xs};
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${BORDER_COLORS.one};
    border-radius: 2px;
  }
`

export const EntryItemContainer = styled(motion.div)`
  position: relative;
  overflow: visible;
  min-height: 28px;
`

export const EntryItemInner = styled(motion.div)`
  position: relative;
  width: 91%;
  padding-right: ${spacing.xs};
`

const getIntensityColor = (intensity?: number, opacity = '4D') => {
  if (!intensity) return `#333333${opacity}`

  switch (intensity) {
    case 1:
      return OUTCOME_COLORS.win.one + opacity
    case 2:
      return OUTCOME_COLORS.win.two + opacity
    case 3:
      return OUTCOME_COLORS.win.three + opacity
    case 4:
      return OUTCOME_COLORS.win.four + opacity
    case 5:
      return OUTCOME_COLORS.win.five + opacity
    default:
      return OUTCOME_COLORS.win.one + opacity
  }
}

export const EntryItem = styled(motion.div)<{ $isWinning?: boolean; $intensity?: number }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.xs} ${spacing.sm};
  font-size: ${fontSize};
  background: ${props => {
    if (!props.$isWinning) return 'rgba(0, 0, 0, 0.2)'
    switch (props.$intensity) {
      case 1:
        return 'rgba(26, 185, 26, 0.1)'
      case 2:
        return 'rgba(26, 215, 26, 0.1)'
      case 3:
        return 'rgba(26, 245, 26, 0.1)'
      case 4:
        return 'rgba(255, 215, 0, 0.1)'
      case 5:
        return 'rgba(217, 0, 213, 0.1)'
      default:
        return 'rgba(26, 185, 26, 0.1)'
    }
  }};
  backdrop-filter: blur(5px);
  transition: background 0.2s ease;
  width: 100%;
  position: relative;

  &:hover {
    background: ${props => {
      if (!props.$isWinning) return 'rgba(0, 0, 0, 0.3)'
      switch (props.$intensity) {
        case 1:
          return 'rgba(26, 185, 26, 0.15)'
        case 2:
          return 'rgba(26, 215, 26, 0.15)'
        case 3:
          return 'rgba(26, 245, 26, 0.15)'
        case 4:
          return 'rgba(255, 215, 0, 0.15)'
        case 5:
          return 'rgba(217, 0, 213, 0.15)'
        default:
          return 'rgba(26, 185, 26, 0.15)'
      }
    }};
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid
      ${props => {
        if (!props.$isWinning) return BORDER_COLORS.one
        switch (props.$intensity) {
          case 1:
            return OUTCOME_COLORS.win.one
          case 2:
            return OUTCOME_COLORS.win.two
          case 3:
            return OUTCOME_COLORS.win.three
          case 4:
            return OUTCOME_COLORS.win.four
          case 5:
            return OUTCOME_COLORS.win.five
          default:
            return OUTCOME_COLORS.win.one
        }
      }};
    border-radius: 3px;
    pointer-events: none;
    ${props =>
      props.$isWinning &&
      css<{ $intensity?: number }>`
        box-shadow: 0 0 8px ${props => getIntensityColor(props.$intensity)};
        animation: glowPulse 1.5s infinite;
      `}
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`

export const EntryChip = styled.div<{ $value: number; $minBetAmount: number }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => {
    const multiplier = props.$value / props.$minBetAmount
    if (multiplier < 5) return CHIP_COLORS.one
    if (multiplier < 25) return CHIP_COLORS.five
    if (multiplier < 100) return CHIP_COLORS.twentyFive
    return CHIP_COLORS.hundred
  }};
  border: ${props =>
    props.$value === props.$minBetAmount ? '2px dashed blue' : '2px dashed white'};
  box-shadow: inset 0 0 ${spacing.sm} rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSizeSm};
  font-weight: 600;
  color: ${props => (props.$value === props.$minBetAmount ? 'blue' : CHIP_COLORS.text.normal)};
  flex-shrink: 0;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 1px solid ${CHIP_COLORS.border.normal};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`

export const EntryDescription = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${TEXT_COLORS.two};
  margin-left: ${spacing.xs};
  font-size: ${fontSize};
  letter-spacing: 0.5px;
`

export const RemoveButton = styled.button<{ $disabled?: boolean }>`
  background: transparent;
  border: none;
  color: ${TEXT_COLORS.two};
  padding: 1px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? '0.4' : '0.4')};
  transition: ${transition};
  margin-left: auto;
  font-size: ${fontSizeLg};
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    opacity: ${props => (props.$disabled ? '0.4' : '1')};
    background: ${props => (props.$disabled ? 'transparent' : 'rgba(255, 255, 255, 0.1)')};
  }
`

export const EmptyStateContainer = styled(motion.div)`
  position: relative;
  overflow: hidden;
`

export const EmptyStateContent = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${darkBgColor};
  border: 1px dashed ${BORDER_COLORS.one};
  border-radius: ${spacing.xs};
  color: ${TEXT_COLORS.two};
  backdrop-filter: blur(5px);
`

export const EmptyStateText = styled.div`
  font-size: 12px;
  opacity: 0.8;
  letter-spacing: 0.5px;
`

export const ClearAllButton = styled.button<{
  $accentColor: string
  $textColor: string
}>`
  padding: ${spacing.sm} ${spacing.md};
  background-color: transparent;
  color: ${props => props.$textColor};
  border: 1px solid ${props => props.$accentColor};
  border-radius: ${spacing.xs};
  cursor: pointer;
  font-size: ${fontSizeLg};
  font-weight: bold;
  transition: ${transition};
  width: 100%;
  margin-top: ${spacing.sm};

  &:hover {
    background-color: ${props => props.$accentColor};
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
