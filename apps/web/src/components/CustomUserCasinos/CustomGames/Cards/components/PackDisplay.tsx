// @ts-nocheck
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { styled } from 'styled-components'
import { useCardsGameStore } from '../store/CardsGameStore'
import { CardsGameLogic } from '../logic/CardsGameLogic'
import { Card } from './Card'
import { DEFAULT_CARDS_PARAMETERS } from '../types'
import { cardDrawCountToOpenAPack } from '@/components/CustomUserCasinos/lib/crypto/cards'

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  flex-grow: 0;
  min-height: fit-content;
`

const Title = styled.h1`
  color: white;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: bold;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: clamp(0.625rem, 1.5vw, 0.75rem);
  margin-top: 0.25rem;
  text-align: center;
`

const CardsContainer = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0; // Important for flex children
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
`

const GridWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  overflow: hidden;
  box-sizing: border-box;
`

const CardsGrid = styled.div<{
  $count: number
  $columns: number
  $packType: number
  $gap?: number
}>`
  display: ${props => (props.$packType === 2 ? 'flex' : 'grid')};
  ${props =>
    props.$packType === 2 ?
      `
    flex-direction: column;
    align-items: center;
    gap: ${props.$gap ? `${props.$gap}px` : '1rem'};
  `
    : `
    grid-template-columns: repeat(${props.$columns}, 1fr);
    gap: ${props.$gap ? `${props.$gap}px` : '1rem'};
  `}
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  place-items: center;
  justify-content: center;
  align-content: center;
  transition: gap 0.3s ease;
`

const CardRow = styled.div<{ $gap?: number }>`
  display: flex;
  gap: ${props => (props.$gap ? `${props.$gap}px` : '1rem')};
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
`

// Debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const PackDisplay: React.FC = () => {
  const { selectedPack, parameters, entry } = useCardsGameStore()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [gridColumns, setGridColumns] = useState(3)
  const resizeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Get bet amount from entry
  const betAmount = entry?.entryAmount || 1

  // Helper function to get tier color
  const getTierColor = useCallback(
    (card: any) => {
      const tier = card.tier
      if (!tier) return undefined

      switch (tier) {
        case 'common':
          return parameters.commonColor || '#B0B0B0'
        case 'rare':
          return parameters.rareColor || '#0088FF'
        case 'epic':
          return parameters.epicColor || '#9932CC'
        case 'legendary':
          return parameters.legendaryColor || '#FF8C00'
        default:
          return undefined
      }
    },
    [parameters.commonColor, parameters.rareColor, parameters.epicColor, parameters.legendaryColor]
  )

  const currentPack = selectedPack ?? 0
  const packInfo = CardsGameLogic.getPackInfo(currentPack, parameters)

  // Set grid columns based on pack type
  useEffect(() => {
    const columns = currentPack === 2 ? 5 : 3
    setGridColumns(columns)
  }, [currentPack])

  // Relative size factors for each pack type
  const PACK_SIZE_FACTORS = {
    0: 0.35, // Beginner (3 cards) - larger cards
    1: 0.25, // Intermediate (6 cards) - medium cards
    2: 0.25, // Expert (9 cards) - 5 top, 4 bottom layout
  }

  const [cardDimensions, setCardDimensions] = useState({ width: 100, height: 140, gap: 16 })

  // Memoized calculation function with debouncing
  const calculateCardDimensions = useCallback(
    debounce(() => {
      if (!containerRef.current) return

      const containerPadding = 24
      const containerWidth = Math.max(containerRef.current.offsetWidth - containerPadding, 1)
      const containerHeight = Math.max(containerRef.current.offsetHeight - containerPadding, 1)

      // Boundary check to prevent invalid calculations
      if (containerWidth <= 0 || containerHeight <= 0) {
        return
      }

      const sizeFactor = PACK_SIZE_FACTORS[currentPack as 0 | 1 | 2] || 0.22
      let cardWidth: number

      if (currentPack === 2) {
        const gapRatio = 0.15
        const cardsPerRow = 5
        const totalGaps = cardsPerRow - 1

        // Safe division with boundary checks
        const denominator = cardsPerRow + totalGaps * gapRatio
        const maxCardWidthFromContainer =
          denominator > 0 ? (containerWidth * 0.95) / denominator : 100

        const heightDenominator = 2.95
        const maxCardWidthFromHeight = containerHeight / heightDenominator

        cardWidth = Math.min(maxCardWidthFromContainer, maxCardWidthFromHeight)

        const maxFromFactor = Math.min(containerWidth, containerHeight) * sizeFactor
        cardWidth = Math.min(cardWidth, maxFromFactor)
      } else {
        const baseSize = Math.min(containerWidth, containerHeight)
        cardWidth = baseSize * sizeFactor
      }

      // Ensure minimum card dimensions
      cardWidth = Math.max(cardWidth, 50)
      const cardHeight = cardWidth * 1.4

      const gap = Math.max(Math.round(cardWidth * 0.15), 8)

      setCardDimensions({
        width: Math.round(cardWidth),
        height: Math.round(cardHeight),
        gap: gap,
      })
    }, 150),
    [currentPack]
  )

  useEffect(() => {
    calculateCardDimensions()

    // Clean up any existing timer
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current)
    }

    // Delayed calculation to ensure DOM is ready
    resizeTimerRef.current = setTimeout(calculateCardDimensions, 100)

    const handleResize = calculateCardDimensions
    window.addEventListener('resize', handleResize)

    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [calculateCardDimensions])

  // Helper function to get default cards from the catalog with proper value calculation
  const getDefaultCards = useCallback((packType: number, betAmount: number) => {
    // Use the default catalog from DEFAULT_CARDS_PARAMETERS
    const defaultCatalog = DEFAULT_CARDS_PARAMETERS.cardsCatalog
    const defaultPackCards = defaultCatalog.filter(card => card.packId === packType)

    // Sort by indexInsidePack to maintain correct order
    defaultPackCards.sort((a, b) => (a.indexInsidePack || 0) - (b.indexInsidePack || 0))

    return defaultPackCards.map((card, index) => {
      const slotIndex = card.indexInsidePack || index
      const value = CardsGameLogic.calculateCardValue(slotIndex, packType, betAmount)

      return {
        ...card,
        icon: card.iconUrl,
        value: value,
        stableKey: `default-${packType}-${card.id}-${index}`,
      }
    })
  }, [])

  // Memoize cards calculation using live game approach
  const cards = useMemo(() => {
    const catalog = parameters.cardsCatalog || []
    const packCards = catalog.filter(card => card.packId === currentPack)

    // Sort by indexInsidePack to maintain correct order
    packCards.sort((a, b) => (a.indexInsidePack || 0) - (b.indexInsidePack || 0))

    if (packCards.length === 0) {
      return getDefaultCards(currentPack, betAmount)
    }

    return packCards.map((card, index) => {
      const slotIndex = card.indexInsidePack || index
      const value = CardsGameLogic.calculateCardValue(slotIndex, currentPack, betAmount)

      return {
        ...card,
        stableKey: `${currentPack}-${card.id}-${index}`,
        icon: card.iconUrl || '🃏',
        value: value,
      }
    })
  }, [currentPack, parameters.cardsCatalog, betAmount, getDefaultCards])

  const getName = useCallback((packInfo: any) => {
    if (packInfo.name.includes(' Pack')) {
      return packInfo.name
    }
    return `${packInfo.name} Pack`
  }, [])

  // Render cards in the appropriate layout
  const renderCards = useCallback(
    (cards: any[]) => {
      if (currentPack === 2) {
        return (
          <CardsGrid
            $count={cards.length}
            $columns={gridColumns}
            $packType={currentPack}
            $gap={cardDimensions.gap}
          >
            <CardRow $gap={cardDimensions.gap}>
              {cards.slice(0, 5).map(card => (
                <Card
                  key={card.stableKey}
                  name={card.name}
                  icon={card.icon}
                  size='dynamic'
                  width={cardDimensions.width}
                  height={cardDimensions.height}
                  isRevealed={true}
                  tierColor={getTierColor(card)}
                  tier={card.tier}
                  iconSize={parameters.iconSize}
                  value={card.value}
                  showValueOnHover={true}
                />
              ))}
            </CardRow>
            <CardRow $gap={cardDimensions.gap}>
              {cards.slice(5, 9).map(card => (
                <Card
                  key={card.stableKey}
                  name={card.name}
                  icon={card.icon}
                  size='dynamic'
                  width={cardDimensions.width}
                  height={cardDimensions.height}
                  isRevealed={true}
                  tierColor={getTierColor(card)}
                  tier={card.tier}
                  iconSize={parameters.iconSize}
                  value={card.value}
                  showValueOnHover={true}
                />
              ))}
            </CardRow>
          </CardsGrid>
        )
      }

      return (
        <CardsGrid
          $count={cards.length}
          $columns={gridColumns}
          $packType={currentPack}
          $gap={cardDimensions.gap}
        >
          {cards.map(card => (
            <Card
              key={card.stableKey}
              name={card.name}
              icon={card.icon}
              size='dynamic'
              width={cardDimensions.width}
              height={cardDimensions.height}
              isRevealed={true}
              tierColor={getTierColor(card)}
              tier={card.tier}
              iconSize={parameters.iconSize}
              value={card.value}
              showValueOnHover={true}
            />
          ))}
        </CardsGrid>
      )
    },
    [currentPack, gridColumns, cardDimensions, getTierColor, parameters.iconSize]
  )

  return (
    <Container>
      <Header>
        <Title>{getName(packInfo)}</Title>
        <Subtitle>
          {cards.length} distinct cards • {cardDrawCountToOpenAPack} cards drawn • ${packInfo.price} •{' '}
          {(packInfo.ev * 100).toFixed(1)}% RTP
        </Subtitle>
      </Header>

      <CardsContainer>
        <GridWrapper ref={containerRef}>{renderCards(cards)}</GridWrapper>
      </CardsContainer>
    </Container>
  )
}
