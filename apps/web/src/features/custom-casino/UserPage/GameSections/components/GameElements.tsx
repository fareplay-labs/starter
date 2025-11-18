// @ts-nocheck
import React from 'react'
import { useState } from 'react'
import { styled, keyframes } from 'styled-components'
import { SPACING, TEXT_COLORS } from '@/design'
import { SVGS } from '@/assets'
import { GAME_ICONS, hexToRgba } from '../utils'
import { type AppGameName } from '@/chains/types'
import { noUserSelect } from '@/style'

// Props interfaces
interface GameIconProps {
  icon?: string
  type?: AppGameName
  size?: 'small' | 'medium' | 'large'
  alt: string
}

interface GameNameProps {
  name: string
  textColor?: string
  size?: 'small' | 'medium' | 'large'
}

interface GameDescriptionProps {
  description: string
  textColor?: string
}

// Styled components
const SGameIcon = styled.div<{ $size?: 'small' | 'medium' | 'large' }>`
  width: ${props =>
    props.$size === 'small' ? '48px'
    : props.$size === 'large' ? '120px'
    : '64px'};
  height: ${props =>
    props.$size === 'small' ? '48px'
    : props.$size === 'large' ? '120px'
    : '64px'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  /* Fixed height container to prevent layout shifts */
  min-height: ${props =>
    props.$size === 'small' ? '48px'
    : props.$size === 'large' ? '120px'
    : '64px'};

  img {
    width: 80%;
    height: 80%;
    object-fit: contain;
    transition: transform 0.3s ease;
    max-width: 100%;
    max-height: 100%;
  }
`

const SGameName = styled.div<{
  $textColor?: string
  $size?: 'small' | 'medium' | 'large'
}>`
  color: ${props => props.$textColor || '#fff'};
  font-size: ${props =>
    props.$size === 'small' ? '14px'
    : props.$size === 'large' ? '20px'
    : '16px'};
  font-weight: ${props =>
    props.$size === 'large' ? '700'
    : props.$size === 'medium' ? '600'
    : '500'};
  text-align: center;
  width: 100%;
  white-space: normal;
  line-height: 1.2;
  padding: 0;
  transition: transform 0.3s ease;
  overflow: visible;
  display: block;
  /* Limit to 2 lines max */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 2.6em;
`

const SGameDescription = styled.div<{
  $textColor?: string
}>`
  color: ${props =>
    props.$textColor ? hexToRgba(props.$textColor, 0.8) : 'rgba(255, 255, 255, 0.8)'};
  font-size: 16px;
  text-align: center;
  margin-top: ${SPACING.sm}px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: 44px;
  width: 100%;
`

// Component implementations
export const GameIcon: React.FC<GameIconProps> = ({ icon, type, size = 'medium', alt }) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  // Determine the source based on priority: custom icon -> default type icon -> question mark
  const getImageSource = () => {
    // If we have a custom icon and it hasn't errored, use it
    if (icon && typeof icon === 'string' && !imageError) {
      return icon
    }
    // Otherwise fall back to type-based icon or question mark
    return (type && GAME_ICONS[type]) || SVGS.questionMarkIcon
  }

  return (
    <SGameIcon $size={size}>
      <img src={getImageSource()} alt={alt} onError={handleImageError} />
    </SGameIcon>
  )
}

export const GameName: React.FC<GameNameProps> = ({ name, textColor, size = 'medium' }) => (
  <SGameName $textColor={textColor} $size={size}>
    {name}
  </SGameName>
)

export const GameDescription: React.FC<GameDescriptionProps> = ({ description, textColor }) => (
  <SGameDescription $textColor={textColor}>{description}</SGameDescription>
)

// Animation for game name hover
const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.8) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
`

const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) scale(0.8) translateY(-5px);
  }
`

// Hover name component for small tiles
export const HoverGameName = styled.div<{
  $textColor?: string
  $isVisible: boolean
}>`
  position: absolute;
  bottom: -38px;
  left: 50%;
  transform: translateX(-50%);
  color: ${TEXT_COLORS.one};
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  animation: ${props => (props.$isVisible ? scaleIn : scaleOut)} 0.2s ease forwards;
  animation-fill-mode: forwards;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  z-index: 10;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
`

export const STileContent = styled.div<{ $layout?: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${props => (props.$layout === 'carousel' ? '4px' : `${SPACING.sm}px`)};
  position: relative;
  ${noUserSelect}
`
