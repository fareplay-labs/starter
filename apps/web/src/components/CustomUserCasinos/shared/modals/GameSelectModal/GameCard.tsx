// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { SPACING, TEXT_COLORS } from '@/design'
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

// Delete button styled component
const SDeleteButton = styled.button<{ $color: string }>`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);

  &:hover {
    background-color: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
    transform: scale(1.1);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: #ff5555;
  }
`

const SGameIconWrapper = styled.div`
  width: 60px;
  height: 60px;
  margin-bottom: ${SPACING.sm}px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
`

const SGameName = styled.div<{ $isSelected: boolean; $textColor?: string }>`
  color: ${props => (props.$isSelected ? props.$textColor : TEXT_COLORS.one)};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-top: auto;
  transition: transform 0.2s ease;
`

// Styled components
const SGameCard = styled.div<{
  $isSelected: boolean
  $colors: ThemeColors
}>`
  padding: ${SPACING.md}px;
  border-radius: 8px;
  background-color: rgba(20, 20, 20, 0.85);
  border: 2px solid
    ${props => (props.$isSelected ? props.$colors.themeColor2 : 'rgba(255, 255, 255, 0.1)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    ${SDeleteButton} {
      opacity: 1;
      transform: scale(1);
    }

    ${SGameIconWrapper} {
      transform: scale(1.1);
    }

    ${SGameName} {
      transform: scale(1.2);
    }
  }
`

const SGameIcon = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const SCheckmarkIcon = styled.div<{ $isSelected: boolean; $color: string }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => (props.$isSelected ? props.$color : 'rgba(255, 255, 255, 0.1)')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${props => (props.$isSelected ? 1 : 0.5)};

  svg {
    width: 14px;
    height: 14px;
    fill: white;
  }
`

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
    <SGameCard
      $isSelected={isSelected}
      $colors={themeColors}
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
    >
      {onDelete && (
        <SDeleteButton
          $color={themeColors.themeColor3}
          onClick={handleDelete}
          aria-label={`Delete ${name}`}
          title={`Delete ${name}`}
        >
          <TrashSVG />
        </SDeleteButton>
      )}
      <SCheckmarkIcon $isSelected={isSelected} $color={themeColors.themeColor2} aria-hidden='true'>
        <CheckmarkSVG />
      </SCheckmarkIcon>
      <SGameIconWrapper>
        <SGameIcon src={getIconSrc()} alt={`${name} game icon`} />
      </SGameIconWrapper>
      <SGameName $isSelected={isSelected} $textColor={themeColors.themeColor1}>
        {name}
      </SGameName>
    </SGameCard>
  )
}
