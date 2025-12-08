import React, { useState } from 'react'
import { cn } from '@/lib/utils'
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

// Section container
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="my-8">
    {children}
  </section>
)

// Title container with lines
interface TitleContainerProps {
  colors?: { themeColor1: string; themeColor2: string; themeColor3: string }
  children: React.ReactNode
}

const TitleContainer: React.FC<TitleContainerProps> = ({ colors, children }) => (
  <div className="flex items-center justify-center mb-8 w-full">
    <TitleLine colors={colors} position='left' />
    {children}
    <TitleLine colors={colors} position='right' />
  </div>
)

// Title line with gradient
interface TitleLineProps {
  colors?: { themeColor1: string; themeColor2: string; themeColor3: string }
  position: 'left' | 'right'
}

const TitleLine: React.FC<TitleLineProps> = ({ colors, position }) => {
  const getGradient = () => {
    if (!colors) return '#1b1d26'
    if (position === 'right') {
      return `linear-gradient(90deg, ${colors.themeColor3}, ${colors.themeColor2}, ${colors.themeColor1})`
    }
    return `linear-gradient(90deg, ${colors.themeColor1}, ${colors.themeColor2}, ${colors.themeColor3})`
  }

  return (
    <div
      className="h-0.5 flex-1"
      style={{ background: getGradient() }}
    />
  )
}

// Title text
const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-white mx-6 text-2xl text-center whitespace-nowrap m-0">
    {children}
  </h2>
)

// Games grid
const GamesGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className={cn(
      'grid grid-cols-6 gap-6',
      'max-[1200px]:grid-cols-4',
      'max-[992px]:grid-cols-3 max-[992px]:gap-4'
    )}
    role='list'
    aria-label='Available games'
  >
    {children}
  </div>
)

// Game tile
interface GameTileProps {
  borderColor?: string
  hoverColors?: { secondary: string; tertiary: string }
  children: React.ReactNode
}

const GameTile: React.FC<GameTileProps> = ({ borderColor, hoverColors, children }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'bg-casino-dark rounded-xl p-6 flex flex-col items-center cursor-pointer',
        'transition-all duration-200 ease-in-out',
        isHovered && '-translate-y-1'
      )}
      style={{
        border: `1px solid ${isHovered && hoverColors?.tertiary ? hoverColors.tertiary : borderColor || '#1b1d26'}`,
        boxShadow: isHovered && hoverColors ?
          `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px ${hoverColors.secondary}` :
          'none'
      }}
      role='listitem'
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}

// Game icon container
const GameIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-[60px] h-[60px] mb-4 flex items-center justify-center [&_img]:w-full [&_img]:h-full [&_img]:object-contain">
    {children}
  </div>
)

// Game name
interface GameNameProps {
  textColor?: string
  children: React.ReactNode
}

const GameName: React.FC<GameNameProps> = ({ textColor, children }) => (
  <div
    className="text-base font-semibold text-center"
    style={{ color: textColor || '#ffffff' }}
  >
    {children}
  </div>
)

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
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageError = (gameId: string) => {
    setFailedImages(prev => new Set(prev).add(gameId))
  }

  return (
    <Section>
      <TitleContainer colors={themeColors}>
        <Title>Games</Title>
      </TitleContainer>
      <GamesGrid>
        {displayGames.map(game => (
          <GameTile
            key={game.id}
            borderColor={themeColors?.themeColor1}
            hoverColors={
              themeColors ?
                {
                  secondary: themeColors.themeColor2,
                  tertiary: themeColors.themeColor3,
                }
              : undefined
            }
          >
            <GameIconWrapper>
              <img
                src={
                  game.icon && !failedImages.has(game.id) ? game.icon
                  : GAME_ICONS[game.type] || SVGS.questionMarkIcon
                }
                alt={`${game.name} game icon`}
                onError={() => handleImageError(game.id)}
              />
            </GameIconWrapper>
            <GameName textColor={themeColors?.themeColor1}>{game.name}</GameName>
          </GameTile>
        ))}
      </GamesGrid>
    </Section>
  )
}
