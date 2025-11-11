// @ts-nocheck
import { styled } from 'styled-components'
import { SPACING } from '@/design'
import { FancyBorder } from '@/components/CustomUserCasinos/FancyBorders/v2'
import React from 'react'

// Base tile styling
const SBaseTile = styled.div<{
  $borderColor?: string
  $hoverColors?: { secondary: string; tertiary: string }
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${SPACING.md}px;
  border-radius: 12px;
  background: rgba(26, 26, 26, 0.65);
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: visible;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 50%);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(26, 26, 26, 0.75);

    > * {
      transform: scale(1.05);
    }
  }
`

// Carousel tile
export const CarouselTile = styled(SBaseTile)`
  width: 140px;
  min-width: 140px;
  height: 180px;
  scroll-snap-align: center;
  scroll-snap-align: center inline; /* Safari fallback */
  padding: ${SPACING.md}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: visible;

  /* Ensure content is visible */
  > * {
    overflow: visible;
  }

  &.centered {
    will-change: transform, width, height;
    height: 200px;
    width: 160px;
    z-index: 2;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
`

// Small tile
export const SmallTile = styled(SBaseTile)`
  width: 100%;
  aspect-ratio: 1;
  padding: ${SPACING.sm}px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Remove any margins or padding that might affect centering */
  > * {
    margin: 0;
    padding: 0;
  }
`

// Large tile
export const LargeTile = styled(SBaseTile)`
  width: 100%;
  height: 260px;
  padding: ${SPACING.xl}px;
  display: flex;
  gap: ${SPACING.lg}px;
  align-items: center;
  justify-content: center;
`

// Wrapper component for game tiles that includes controls
export const GameTileWrapper = styled.div`
  position: relative;

  &:hover > div:last-child {
    opacity: 1;
  }
`

// Enhanced GameTileWrapper with FancyBorder
export const FancyTileWrapper: React.FC<{
  children: React.ReactNode
  themeColor?: string
  secondaryColor?: string
  tertiaryColor?: string
  className?: string
  index?: number
}> = ({
  children,
  themeColor = '#ff5e4f',
  secondaryColor,
  tertiaryColor,
  className = '',
  index = 0,
}) => {
  // Use all available theme colors for the gradient
  const gradientColors = [
    themeColor,
    secondaryColor || themeColor,
    tertiaryColor || secondaryColor || themeColor,
  ]

  // Calculate sequential delay based on index
  const baseDelay = 0.25
  const sequentialDelay = baseDelay + index * 0.3

  return (
    <FancyBorder
      color={themeColor}
      width='3px'
      borderStyle='solid'
      radius='16px'
      animated={true}
      animationType='pulse'
      isGradient={true}
      gradientColors={gradientColors}
      gradientDirection='to bottom right'
      animateOnHoverOnly={true}
      animationConfig={{
        duration: 1.75,
        minOpacity: 0.5,
        maxOpacity: 1,
        defaultMaxOpacity: true,
      }}
      entryAnimation={true}
      entryAnimationConfig={{
        delay: sequentialDelay,
        duration: 1,
        type: 'corners-to-center',
        cornerSize: 0,
      }}
      className={className}
      style={{
        backgroundColor: 'transparent',
        overflow: 'visible',
      }}
    >
      {children}
    </FancyBorder>
  )
}
