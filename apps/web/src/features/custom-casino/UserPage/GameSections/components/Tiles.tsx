import React from 'react'
import { cn } from '@/lib/utils'
import { FancyBorder } from '@/features/custom-casino/FancyBorders/v2'

// Base tile component
interface BaseTileProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  'aria-label'?: string
}

const BaseTile: React.FC<BaseTileProps> = ({ children, className, onClick, style, 'aria-label': ariaLabel }) => (
  <div
    onClick={onClick}
    style={style}
    aria-label={ariaLabel}
    className={cn(
      'flex flex-col items-center justify-center p-4 rounded-xl',
      'bg-[rgba(26,26,26,0.65)] border-none cursor-pointer',
      'transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]',
      'relative overflow-visible box-border',
      // Gradient overlay via before pseudo
      'before:content-[""] before:absolute before:inset-0',
      'before:bg-gradient-to-br before:from-white/[0.03] before:via-transparent before:to-transparent',
      'before:z-0',
      // Children positioning
      '[&>*]:relative [&>*]:z-[1] [&>*]:transition-transform [&>*]:duration-300',
      // Hover state
      'hover:bg-[rgba(26,26,26,0.75)] hover:[&>*]:scale-105',
      className
    )}
  >
    {children}
  </div>
)

// Carousel tile
interface CarouselTileProps {
  children: React.ReactNode
  className?: string
  isCentered?: boolean
  onClick?: () => void
  style?: React.CSSProperties
  'aria-label'?: string
}

export const CarouselTile: React.FC<CarouselTileProps> = ({
  children,
  className,
  isCentered = false,
  onClick,
  style,
  'aria-label': ariaLabel
}) => (
  <BaseTile
    onClick={onClick}
    style={style}
    aria-label={ariaLabel}
    className={cn(
      'w-[140px] min-w-[140px] h-[180px] snap-center p-4',
      '[&>*]:overflow-visible',
      isCentered && 'will-change-transform h-[200px] w-[160px] z-[2] transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]',
      className
    )}
  >
    {children}
  </BaseTile>
)

// Small tile
interface SmallTileProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  'aria-label'?: string
  isCentered?: boolean
}

export const SmallTile: React.FC<SmallTileProps> = ({ children, className, onClick, style, 'aria-label': ariaLabel }) => (
  <BaseTile
    onClick={onClick}
    style={style}
    aria-label={ariaLabel}
    className={cn(
      'w-full aspect-square p-3 transition-all duration-200',
      '[&>*]:m-0 [&>*]:p-0',
      className
    )}
  >
    {children}
  </BaseTile>
)

// Large tile
interface LargeTileProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  'aria-label'?: string
  isCentered?: boolean
}

export const LargeTile: React.FC<LargeTileProps> = ({ children, className, onClick, style, 'aria-label': ariaLabel }) => (
  <BaseTile
    onClick={onClick}
    style={style}
    aria-label={ariaLabel}
    className={cn(
      'w-full h-[260px] p-8 gap-6',
      className
    )}
  >
    {children}
  </BaseTile>
)

// Game tile wrapper
interface GameTileWrapperProps {
  children: React.ReactNode
  className?: string
}

export const GameTileWrapper: React.FC<GameTileWrapperProps> = ({ children, className }) => (
  <div
    className={cn(
      'relative',
      '[&:hover>div:last-child]:opacity-100',
      className
    )}
  >
    {children}
  </div>
)

// Enhanced GameTileWrapper with FancyBorder
interface FancyTileWrapperProps {
  children: React.ReactNode
  themeColor?: string
  secondaryColor?: string
  tertiaryColor?: string
  className?: string
  index?: number
}

export const FancyTileWrapper: React.FC<FancyTileWrapperProps> = ({
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
