// @ts-nocheck
import React from 'react'
import { styled } from 'styled-components'
import { BORDER_COLORS, BREAKPOINTS, SPACING, TEXT_COLORS } from '@/design'
import { SVGS } from '@/assets'
import { type CustomCasinoGame } from '../../shared/types'
import { AppGameName } from '@/chains/types'
import { DEFAULT_GAMES } from './defaultGames'

interface GameTilesProps {
  games: CustomCasinoGame[]
  isEditMode?: boolean
  themeColors?: {
    themeColor1: string
    themeColor2: string
    themeColor3: string
  }
}

const SSection = styled.section`
  margin: ${SPACING.xl}px 0;
`

const STitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 ${SPACING.xl}px 0;
  width: 100%;
`

const STitleLine = styled.div<{
  $colors?: { themeColor1: string; themeColor2: string; themeColor3: string }
  $position?: 'left' | 'right'
}>`
  height: 2px;
  background: ${props =>
    props.$colors ?
      props.$position === 'right' ?
        `linear-gradient(90deg, ${props.$colors.themeColor3}, ${props.$colors.themeColor2}, ${props.$colors.themeColor1})`
      : `linear-gradient(90deg, ${props.$colors.themeColor1}, ${props.$colors.themeColor2}, ${props.$colors.themeColor3})`
    : BORDER_COLORS.one};
  flex: 1;
`

const STitle = styled.h2`
  color: ${TEXT_COLORS.one};
  margin: 0 ${SPACING.lg}px;
  font-size: 24px;
  text-align: center;
  white-space: nowrap;
`

const SGamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${SPACING.lg}px;

  @media (max-width: ${BREAKPOINTS.md}px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${SPACING.md}px;
  }
`

const SGameTile = styled.div<{
  $borderColor?: string
  $hoverColors?: { secondary: string; tertiary: string }
}>`
  background: #0a0a0a;
  border: 1px solid ${props => props.$borderColor || BORDER_COLORS.one};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$hoverColors?.tertiary || BORDER_COLORS.two};
    box-shadow: ${props =>
      props.$hoverColors ?
        `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px ${props.$hoverColors.secondary}`
      : '0 4px 12px rgba(0, 0, 0, 0.2)'};
  }
`

const SGameIcon = styled.div`
  width: 60px;
  height: 60px;
  margin-bottom: ${SPACING.md}px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const SGameName = styled.div<{ $textColor?: string }>`
  color: ${props => props.$textColor || TEXT_COLORS.one};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`

// Map of game types to icon SVGs
export const GAME_ICONS: Record<AppGameName, string> = {
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

export const GameTiles: React.FC<GameTilesProps> = ({ games = [], themeColors }) => {
  // Use provided games or fallback to defaults if empty
  const displayGames = games.length > 0 ? games : DEFAULT_GAMES
  
  // Track failed images
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set())
  
  const handleImageError = (gameId: string) => {
    setFailedImages(prev => new Set(prev).add(gameId))
  }

  return (
    <SSection>
      <STitleContainer>
        <STitleLine $colors={themeColors} $position='left' />
        <STitle>Games</STitle>
        <STitleLine $colors={themeColors} $position='right' />
      </STitleContainer>
      <SGamesGrid role='list' aria-label='Available games'>
        {displayGames.map(game => (
          <SGameTile
            key={game.id}
            $borderColor={themeColors?.themeColor1}
            $hoverColors={
              themeColors ?
                {
                  secondary: themeColors.themeColor2,
                  tertiary: themeColors.themeColor3,
                }
              : undefined
            }
            role='listitem'
            tabIndex={0}
          >
            <SGameIcon>
              <img
                src={
                  game.icon && !failedImages.has(game.id) ? game.icon
                  : GAME_ICONS[game.type] || SVGS.questionMarkIcon
                }
                alt={`${game.name} game icon`}
                onError={() => handleImageError(game.id)}
              />
            </SGameIcon>
            <SGameName $textColor={themeColors?.themeColor1}>{game.name}</SGameName>
          </SGameTile>
        ))}
      </SGamesGrid>
    </SSection>
  )
}
