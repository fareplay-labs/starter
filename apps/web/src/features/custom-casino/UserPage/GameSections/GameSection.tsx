import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { type CustomCasinoGame } from '../../shared/types'
import {
  SectionTitle,
  SectionControls,
  GameControls,
  CarouselLayout,
  SmallTilesLayout,
  LargeTilesLayout,
  CarouselTile,
  SmallTile,
  LargeTile,
  GameIcon,
  GameName,
  GameDescription,
  FancyTileWrapper,
  HoverGameName,
  TileContent,
} from './components'
import { useInfiniteCarouselCenter } from './hooks/useInfiniteCarouselCenter'
import { type GameSectionProps } from './types'

// Section container
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="my-8 relative bg-transparent pt-8">
    {children}
  </section>
)

// Game tile container
interface GameTileContainerProps {
  layout?: string
  children: React.ReactNode
}

const GameTileContainer: React.FC<GameTileContainerProps> = ({ layout, children }) => (
  <div
    className={cn(
      'relative overflow-visible flex justify-center items-center max-w-[140px] mx-2 flex-none',
      layout === 'smallTiles' ? 'pb-6' : 'pb-0'
    )}
  >
    {children}
  </div>
)

// Component implementation
export const GameSection: React.FC<GameSectionProps> = ({
  sectionId,
  title,
  games,
  ownerUsername,
  isEditMode,
  themeColors,
  layout = 'carousel',
  onEdit,
  onAddGame,
  onRemoveGame,
  onRemoveSection,
}) => {
  const navigate = useNavigate()
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null)

  const validLayout: 'carousel' | 'smallTiles' | 'largeTiles' =
    layout === 'carousel' || layout === 'smallTiles' || layout === 'largeTiles' ?
      layout
    : 'smallTiles'

  const isCarousel = validLayout === 'carousel'
  const MIN_ITEMS_FOR_INFINITE = 5
  const shouldDuplicate = isCarousel && games.length >= MIN_ITEMS_FOR_INFINITE
  const { carouselRef, duplicatedItems, centerIndex, handleInfiniteScroll } =
    useInfiniteCarouselCenter(games, shouldDuplicate)

  const handleTitleEdit = (_fieldName: string, value: string) => {
    if (onEdit) {
      onEdit(`section.${sectionId}.title`, value)
    }
  }

  const handleGameClick = (game: CustomCasinoGame) => {
    const type = typeof game?.type === 'string' ? game.type : ''
    if (!type) return
    const path =
      game.id ? `/play/${type}/${game.id}`
      : `/play/${type}`
    navigate(path, { state: { game } })
  }

  const renderGameTile = (game: CustomCasinoGame, index: number, absIndex: number) => {
    const tileContent = (
      <TileContent
        layout={validLayout}
        onMouseEnter={() => validLayout === 'smallTiles' && setHoveredGameId(game.id)}
        onMouseLeave={() => validLayout === 'smallTiles' && setHoveredGameId(null)}
      >
        <GameIcon
          icon={game.icon}
          type={game.type}
          size={
            validLayout === 'largeTiles' ? 'large'
            : validLayout === 'smallTiles' ?
              'small'
            : 'medium'
          }
          alt={`${game.name} game icon`}
        />

        {validLayout !== 'smallTiles' && (
          <GameName
            name={game.name}
            textColor={validLayout === 'largeTiles' ? themeColors.themeColor2 : undefined}
            size={validLayout === 'largeTiles' ? 'large' : 'medium'}
          />
        )}

        {validLayout === 'smallTiles' && (
          <HoverGameName
            name={game.name}
            textColor={themeColors.themeColor1}
            isVisible={hoveredGameId === game.id}
          />
        )}

        {validLayout === 'largeTiles' && game.config?.description && (
          <GameDescription
            description={game.config.description}
            textColor={themeColors.themeColor1}
          />
        )}

        {isEditMode && (
          <GameControls
            themeColors={themeColors}
            onEdit={() => onRemoveGame?.(sectionId, game.id)}
            gameName={game.name}
          />
        )}
      </TileContent>
    )

    const tileProps = {
      onClick: () => handleGameClick(game),
      'aria-label': `Play ${game.name}`,
      style: { background: 'rgba(10, 10, 10, 0.65)' },
    }

    const TileComponent =
      validLayout === 'carousel' ? CarouselTile
      : validLayout === 'smallTiles' ? SmallTile
      : LargeTile

    // Use absIndex for the centered class if over 5
    const isCentered = validLayout === 'carousel' && shouldDuplicate && absIndex === centerIndex

    return (
      <GameTileContainer key={`${game.id}-${absIndex}`} layout={validLayout}>
        <FancyTileWrapper
          themeColor={themeColors.themeColor1}
          secondaryColor={themeColors.themeColor2}
          tertiaryColor={themeColors.themeColor3}
          index={index}
        >
          <TileComponent {...tileProps} isCentered={isCentered}>
            {tileContent}
          </TileComponent>
        </FancyTileWrapper>
      </GameTileContainer>
    )
  }

  const LayoutComponent =
    validLayout === 'carousel' ? CarouselLayout
    : validLayout === 'smallTiles' ? SmallTilesLayout
    : LargeTilesLayout

  return (
    <Section>
      {isEditMode && (
        <SectionControls
          themeColors={themeColors}
          onLayoutToggle={() => {}}
          onAddGame={() => onAddGame?.(sectionId)}
          onRemoveSection={() => onRemoveSection?.(sectionId)}
        />
      )}

      <SectionTitle
        title={title}
        themeColors={themeColors}
        isEditMode={isEditMode}
        fieldName={`section.${sectionId}.title`}
        onEdit={handleTitleEdit}
      />
      {isCarousel ?
        <LayoutComponent
          ref={shouldDuplicate ? carouselRef : undefined}
          onScroll={shouldDuplicate ? handleInfiniteScroll : undefined}
        >
          {duplicatedItems.map((game, idx) => renderGameTile(game, idx % games.length, idx))}
        </LayoutComponent>
      : <LayoutComponent>
          {games.map((game, idx) => renderGameTile(game, idx, idx))}
        </LayoutComponent>
      }
    </Section>
  )
}

export default GameSection
