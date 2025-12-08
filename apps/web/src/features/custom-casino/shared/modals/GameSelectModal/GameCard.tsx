// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'
import { SVGS } from '@/assets'
import { AppGameName } from '@/chains/types'
import { type ThemeColors } from '../shared/modalTypes'

// Map of game types to icon SVGs
const GAME_ICONS: Record<AppGameName, string> = {
  [AppGameName.CoinFlip]: SVGS.coin,
  [AppGameName.Dice]: SVGS.diceIcon,
  [AppGameName.RPS]: SVGS.scissorIcon,
  [AppGameName.Bombs]: SVGS.bombIcon,
  [AppGameName.Crash]: SVGS.crashIcon,
  [AppGameName.Plinko]: SVGS.plinkoIcon,
  [AppGameName.Roulette]: SVGS.rouletteIcon,
  [AppGameName.Cards_1]: SVGS.cardsIcon,
  [AppGameName.CryptoLaunch_1]: SVGS.cryptoLaunchIcon,
  [AppGameName.Slots_1]: SVGS.slotsIcon,
}

// Checkmark SVG
const CheckmarkSVG = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
  </svg>
)

// Trash icon SVG
const TrashSVG = () => (
  <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
  </svg>
)

// GameCard props interface
export interface GameCardProps {
  id: string
  name: string
  icon?: string
  type?: AppGameName
  isSelected: boolean
  themeColors: ThemeColors
  onClick: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * Game Card component used in the GameSelectModal
 */
export const GameCard: React.FC<GameCardProps> = ({
  id,
  name,
  icon,
  type,
  isSelected,
  themeColors,
  onClick,
  onDelete,
}) => {
  const handleClick = () => {
    onClick(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  // Get the appropriate icon based on type, icon, or fallback
  const getIconSrc = () => {
    if (type && GAME_ICONS[type]) {
      return GAME_ICONS[type]
    } else if (icon && typeof icon === 'string') {
      return icon
    }
    return SVGS.questionMarkIcon
  }

  return (
    <div
      onClick={handleClick}
      role='option'
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'p-4 rounded-lg bg-[rgba(20,20,20,0.85)] border-2 cursor-pointer',
        'flex flex-col items-center relative overflow-hidden',
        'transition-all duration-200 group'
      )}
      style={{
        borderColor: isSelected ? themeColors.themeColor2 : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          aria-label={`Delete ${name}`}
          title={`Delete ${name}`}
          className={cn(
            'absolute top-2 left-2 w-6 h-6 rounded-full',
            'bg-red-500/10 border border-red-500/30',
            'flex items-center justify-center cursor-pointer',
            'transition-all duration-200 opacity-0 scale-75',
            'hover:bg-red-500/20 hover:border-red-500/50 hover:scale-110',
            'group-hover:opacity-100 group-hover:scale-100',
            '[&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:fill-[#ff5555]'
          )}
        >
          <TrashSVG />
        </button>
      )}

      {/* Checkmark Icon */}
      <div
        className={cn(
          'absolute top-2 right-2 w-5 h-5 rounded-full',
          'flex items-center justify-center transition-all duration-200',
          '[&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:fill-white'
        )}
        style={{
          backgroundColor: isSelected ? themeColors.themeColor2 : 'rgba(255, 255, 255, 0.1)',
          opacity: isSelected ? 1 : 0.5,
        }}
        aria-hidden='true'
      >
        <CheckmarkSVG />
      </div>

      {/* Game Icon */}
      <div className="w-[60px] h-[60px] mb-3 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <img
          src={getIconSrc()}
          alt={`${name} game icon`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Game Name */}
      <div
        className={cn(
          'text-sm font-semibold text-center mt-auto',
          'transition-transform duration-200 group-hover:scale-[1.2]'
        )}
        style={{ color: isSelected ? themeColors.themeColor1 : '#ffffff' }}
      >
        {name}
      </div>
    </div>
  )
}
