// @ts-nocheck
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  STileContent,
} from './components'
import { useInfiniteCarouselCenter } from './hooks/useInfiniteCarouselCenter'
import { GameTileContainer, SSection } from '../styles'
import { type GameSectionProps } from './types'

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
      <STileContent
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
            $textColor={themeColors.themeColor1}
            $isVisible={hoveredGameId === game.id}
          >
            {game.name}
          </HoverGameName>
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
      </STileContent>
    )

    const tileProps = {
      $borderColor: themeColors.themeColor1,
      $hoverColors: {
        secondary: themeColors.themeColor2,
        tertiary: themeColors.themeColor3,
      },
      onClick: () => handleGameClick(game),
      'aria-label': `Play ${game.name}`,
      style: { background: 'rgba(10, 10, 10, 0.65)' },
    }

    const TileComponent =
      validLayout === 'carousel' ? CarouselTile
      : validLayout === 'smallTiles' ? SmallTile
      : LargeTile

    // Use absIndex for the centered class if over 5
    const className =
      validLayout === 'carousel' && shouldDuplicate && absIndex === centerIndex ? 'centered' : undefined

    return (
      <GameTileContainer key={`${game.id}-${absIndex}`} $layout={validLayout}>
        <FancyTileWrapper
          themeColor={themeColors.themeColor1}
          secondaryColor={themeColors.themeColor2}
          tertiaryColor={themeColors.themeColor3}
          index={index}
        >
          <TileComponent {...tileProps} className={className}>
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
    <SSection>
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
    </SSection>
  )
}

export default GameSection
