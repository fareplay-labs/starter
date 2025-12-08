import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { SVGS } from '@/assets'
import { GAME_ICONS, hexToRgba } from '../utils'
import { type AppGameName } from '@/chains/types'

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

// Size mappings
const iconSizes = {
  small: 'w-12 h-12 min-h-[48px]',
  medium: 'w-16 h-16 min-h-[64px]',
  large: 'w-[120px] h-[120px] min-h-[120px]',
}

const nameSizes = {
  small: 'text-sm font-medium',
  medium: 'text-base font-semibold',
  large: 'text-xl font-bold',
}

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
    <div className={cn('flex items-center justify-center mb-1', iconSizes[size])}>
      <img
        src={getImageSource()}
        alt={alt}
        onError={handleImageError}
        className="w-[80%] h-[80%] object-contain transition-transform duration-300 max-w-full max-h-full"
      />
    </div>
  )
}

export const GameName: React.FC<GameNameProps> = ({ name, textColor, size = 'medium' }) => (
  <div
    className={cn(
      'text-center w-full whitespace-normal leading-tight p-0 transition-transform duration-300',
      'line-clamp-2 max-h-[2.6em]',
      nameSizes[size]
    )}
    style={{ color: textColor || '#fff' }}
  >
    {name}
  </div>
)

export const GameDescription: React.FC<GameDescriptionProps> = ({ description, textColor }) => (
  <div
    className="text-base text-center mt-3 overflow-hidden text-ellipsis line-clamp-2 leading-relaxed max-h-[44px] w-full"
    style={{ color: textColor ? hexToRgba(textColor, 0.8) : 'rgba(255, 255, 255, 0.8)' }}
  >
    {description}
  </div>
)

// Hover name component for small tiles
interface HoverGameNameProps {
  name: string
  textColor?: string
  isVisible: boolean
}

export const HoverGameName: React.FC<HoverGameNameProps> = ({ name, isVisible }) => (
  <div
    className={cn(
      'absolute -bottom-[38px] left-1/2 -translate-x-1/2 text-white text-sm font-medium text-center',
      'whitespace-nowrap z-10 max-w-[120px] overflow-hidden text-ellipsis font-inherit',
      'transition-all duration-200',
      isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.8] -translate-y-[5px]'
    )}
  >
    {name}
  </div>
)

// Tile content wrapper
interface TileContentProps {
  layout?: string
  children: React.ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const TileContent: React.FC<TileContentProps> = ({ layout, children, onMouseEnter, onMouseLeave }) => (
  <div
    className={cn(
      'w-full h-full flex flex-col justify-center items-center relative select-none',
      layout === 'carousel' ? 'gap-1' : 'gap-3'
    )}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </div>
)

// Keep the old export name for backwards compatibility
export const STileContent = TileContent
