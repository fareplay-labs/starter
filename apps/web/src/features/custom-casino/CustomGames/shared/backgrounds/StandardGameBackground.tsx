// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { getBackgroundType, parseImageValue } from '../utils/backgroundUtils'
import CroppedImage from '../../../shared/ui/CroppedImage'

interface StandardGameBackgroundProps {
  backgroundColor: string
  /** Optional overlay for image backgrounds */
  overlay?: {
    gradient?: string
    opacity?: number
  }
  /** Additional CSS properties for the container */
  style?: React.CSSProperties
  /** CSS class for additional styling */
  className?: string
  /** Content to render above the background */
  children?: React.ReactNode
}

interface BackgroundContainerProps {
  $backgroundColor: string
  $hasImageBackground: boolean
  $imageOpacity?: number
}

const BackgroundContainer = styled.div<BackgroundContainerProps>`
  background: ${props => {
    if (props.$hasImageBackground) {
      // If image has opacity < 1, use a fallback background color
      if (props.$imageOpacity !== undefined && props.$imageOpacity < 1) {
        // Use a dark gaming-appropriate background color for semi-transparent images
        return '#1a1a1a'
      }
      return 'transparent'
    }
    return props.$backgroundColor
  }};
  padding: 20px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

interface BackgroundImageProps {
  $overlay?: {
    gradient?: string
    opacity?: number
  }
  $imageOpacity?: number
}

const BackgroundImage = styled.div<BackgroundImageProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  /* Apply opacity only to the image, not the overlay */
  & > * {
    opacity: ${props => props.$imageOpacity ?? 1};
  }

  /* Only show default overlay if no custom opacity is set (i.e., opacity is 1) and no custom overlay is provided */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => {
      // If custom opacity is set (not 1), don't apply default dark overlay
      if (props.$imageOpacity !== undefined && props.$imageOpacity < 1) {
        return 'transparent'
      }
      // Otherwise use the provided overlay or default dark overlay
      return (
        props.$overlay?.gradient ||
        'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)'
      )
    }};
    opacity: ${props => props.$overlay?.opacity ?? 1};
    pointer-events: none;
    z-index: 2;
  }
`

const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

/**
 * Standardized background component that supports solid colors, gradients, and images
 * Based on the pattern established in the Bombs game
 * Now supports image opacity through the new 'imageUrl|opacity' format
 */
export const StandardGameBackground: React.FC<StandardGameBackgroundProps> = ({
  backgroundColor,
  overlay,
  style,
  className,
  children,
}) => {
  const backgroundType = getBackgroundType(backgroundColor)
  const hasImageBackground = backgroundType === 'image'

  // Parse image URL and opacity if it's an image background
  const imageData = hasImageBackground ? parseImageValue(backgroundColor) : null

  return (
    <BackgroundContainer
      $backgroundColor={backgroundColor}
      $hasImageBackground={hasImageBackground}
      $imageOpacity={imageData?.opacity}
      style={style}
      className={className}
      data-testid='standard-game-background'
    >
      {hasImageBackground && imageData && (
        <BackgroundImage $overlay={overlay} $imageOpacity={imageData.opacity}>
          <CroppedImage
            imageData={imageData.url}
            alt='Game Background'
            width='100%'
            height='100%'
          />
        </BackgroundImage>
      )}
      <ContentWrapper>{children}</ContentWrapper>
    </BackgroundContainer>
  )
}
