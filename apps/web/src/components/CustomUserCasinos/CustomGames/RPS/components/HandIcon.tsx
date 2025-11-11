// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { IconWrapper, HandIcon as StyledHandIconBase } from '../styles/animation.styles'
import { type RPSChoice } from '../types'
import { getImageUrl } from '@/components/CustomUserCasinos/shared/utils/cropDataUtils'
import rockIconAlt from '@/components/CustomUserCasinos/assets/svg/rps-rock-icon-alt-centered.png'
import paperIconAlt from '@/components/CustomUserCasinos/assets/svg/rps-paper-icon-alt.svg'
import scissorsIconAlt from '@/components/CustomUserCasinos/assets/svg/rps-scissors-icon-alt.svg'

interface HandIconProps {
  choice: RPSChoice | null
  isPlaying: boolean
  isRight?: boolean
  flipped?: boolean
  idle?: boolean
  useCustomIcons?: boolean
  customRockImage?: string
  customPaperImage?: string
  customScissorsImage?: string
  sizePx?: number
  glow?: boolean
  glowColor?: string
}

const getFareHandSrc = (choice: RPSChoice | null) => {
  if (!choice) {
    return rockIconAlt // Default to rock when idle
  }

  switch (choice) {
    case 'rock':
      return rockIconAlt
    case 'paper':
      return paperIconAlt
    case 'scissors':
      return scissorsIconAlt
    default:
      return rockIconAlt
  }
}

const getChoiceIconSrc = (
  choice: RPSChoice | null,
  useCustomIcons: boolean = false,
  customRockImage?: string,
  customPaperImage?: string,
  customScissorsImage?: string
) => {
  // If not using custom icons or no custom images provided, use Fare hands
  if (!useCustomIcons || (!customRockImage && !customPaperImage && !customScissorsImage)) {
    return getFareHandSrc(choice)
  }

  // Use custom images if available
  if (!choice) {
    // Default to rock image when idle
    return customRockImage ? getImageUrl(customRockImage) : getFareHandSrc('rock')
  }

  switch (choice) {
    case 'rock':
      return customRockImage ? getImageUrl(customRockImage) : getFareHandSrc('rock')
    case 'paper':
      return customPaperImage ? getImageUrl(customPaperImage) : getFareHandSrc('paper')
    case 'scissors':
      return customScissorsImage ? getImageUrl(customScissorsImage) : getFareHandSrc('scissors')
    default:
      return getFareHandSrc(choice)
  }
}

export const HandIcon: React.FC<HandIconProps> = ({
  choice,
  isPlaying,
  isRight,
  flipped,
  idle,
  useCustomIcons = false,
  customRockImage,
  customPaperImage,
  customScissorsImage,
  sizePx,
  glow,
  glowColor,
}) => {
  const iconSrc = getChoiceIconSrc(
    choice,
    useCustomIcons,
    customRockImage,
    customPaperImage,
    customScissorsImage
  )

  return (
    <IconWrapper $isPlaying={isPlaying} $isRight={isRight} $glow={glow} $glowColor={glowColor}>
      <StyledHandIcon 
        src={iconSrc} 
        alt={choice || 'idle'} 
        $flipped={flipped} 
        $idle={idle}
        $absSize={sizePx}
      />
    </IconWrapper>
  )
}

// Override of base StyledHandIcon to support absolute pixel sizing.
// Keep original rotation/flip order and origin to maintain right-hand angle.
const StyledHandIcon = styled(StyledHandIconBase)<{ $absSize?: number }>`
  width: ${props => (props.$absSize ? `${props.$absSize}px` : '90%')};
  height: ${props => (props.$absSize ? `${props.$absSize}px` : '90%')};
  transform-origin: 0 0;
  transform: ${props => {
    const flip = props.$flipped ? 'scaleX(-1)' : ''
    return `${flip} rotate(45deg) translate(-50%, -50%)`
  }};
`
