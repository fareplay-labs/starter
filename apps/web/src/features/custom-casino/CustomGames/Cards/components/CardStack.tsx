// @ts-nocheck
import React, { forwardRef, useImperativeHandle } from 'react'
import { styled } from 'styled-components'
import { Card } from './Card'
import { useCardsSound } from '../hooks/useCardsSound'

interface CardStackProps {
  cards: Array<{
    id: number
    name: string
    value?: number
    icon?: string
    isRevealed: boolean
    tier?: 'common' | 'rare' | 'epic' | 'legendary'
    tierColor?: string
  }>
  currentCardIndex: number
  onStackClick: () => void
  onCardValueRevealed?: (value: number) => void // Called when card flip completes
  revealedCards: Array<{
    id: number
    name: string
    value?: number
    icon?: string
    tier?: 'common' | 'rare' | 'epic' | 'legendary'
    tierColor?: string
  }>
  totalCards: number // Always 6 cards (live game draws exactly 6 cards per pack)
  showAsGrid?: boolean // Animate to grid positions for results
  sleeveRemoved?: boolean // Whether the sleeve has been removed (triggers slide up)
  autoOpen?: boolean // Whether auto-open is enabled (disables manual clicks)
  iconSize?: number // Size multiplier for card icons
}

export interface CardStackHandle {
  triggerClick: () => void
}

const StackContainer = styled.div<{ $sleeveRemoved: boolean }>`
  position: absolute;
  left: 50%;
  bottom: ${props => (props.$sleeveRemoved ? '50%' : '-30%')}; /* Moved down from -25% to -30% */
  transform: ${
    props =>
      props.$sleeveRemoved ?
        'translate(-50%, 50%)' // Center of screen (bottom: 50% + translateY 50% = center)
      : 'translateX(-50%)' // Just center horizontally at bottom
  };
  width: 600px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Smooth slide animation with reduced delay */
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1)
    ${props => (props.$sleeveRemoved ? '0.2s' : '0s')};

  /* Always visible, always rendered */
  opacity: 1;
  visibility: visible;
  z-index: 5; /* Below sleeve which is z-index: 10 */

  /* Pointer events based on state */
  pointer-events: ${props => (props.$sleeveRemoved ? 'auto' : 'none')};

  & > * {
    pointer-events: auto;
  }
`

const MainStack = styled.div<{ $isAnimating?: boolean }>`
  position: relative;
  cursor: ${props => (props.$isAnimating ? 'not-allowed' : 'pointer')};
  width: 180px;
  height: 252px;
  transition: transform 0.2s ease;
  /* Ensure stack is visible */
  opacity: 1;
  visibility: visible;
`

const StackedCard = styled.div<{
  $index: number
  $isFlipping?: boolean
  $isFlipped?: boolean
  $isSliding?: boolean
  $totalCards: number
  $revealedCount: number
  $totalCardsInPack: number
}>`
  position: absolute;
  top: ${props => {
    if (props.$isSliding) return '0px' // Match revealed card position
    return `${(props.$totalCards - props.$index - 1) * -3}px`
  }};
  left: ${props => {
    if (props.$isSliding) {
      // Calculate the target position based on total cards in pack and current revealed count
      const baseOffset = -220
      const cardSpacing = 15
      const totalWidth = (props.$totalCardsInPack - 1) * cardSpacing
      const revealedStackStart = baseOffset - totalWidth / 2
      const cardOffset = props.$revealedCount * cardSpacing
      return `${revealedStackStart + cardOffset}px`
    }
    return `${(props.$totalCards - props.$index - 1) * -3}px`
  }};
  z-index: ${props => (props.$index === 0 ? 100 : props.$totalCards - props.$index)};
  transition: ${props => {
    if (props.$isSliding) return 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    return 'none'
  }};
`

const HoverScale = styled.div<{ $enable: boolean }>`
  transition: transform 0.2s ease;
  ${props => (props.$enable ? '&:hover { transform: scale(1.02); }' : '')}
`

const CardFront = styled.div<{ $isFlipped?: boolean; $isFlipping?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  height: 252px;
  transform-origin: center center;
  animation: ${props => {
    if (props.$isFlipping && props.$isFlipped) {
      return 'flipFrontIn 0.2s ease-out forwards'
    }
    return 'none'
  }};
  transform: ${props =>
    props.$isFlipped && !props.$isFlipping ? 'scaleX(1) scaleY(1)' : 'scaleX(0) scaleY(1.05)'};
  opacity: ${props => (props.$isFlipped ? 1 : 0)};

  @keyframes flipFrontIn {
    from {
      transform: scaleX(0) scaleY(1.05);
      opacity: 1;
    }
    to {
      transform: scaleX(1) scaleY(1);
      opacity: 1;
    }
  }
`

const CardBack = styled.div<{ $isFlipped?: boolean; $isFlipping?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  height: 252px;
  background: linear-gradient(135deg, #2d3748, #1a202c);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform-origin: center center;
  animation: ${props => {
    if (props.$isFlipping && !props.$isFlipped) {
      return 'flipBackOut 0.2s ease-in forwards'
    }
    return 'none'
  }};
  transform: ${props => (props.$isFlipped ? 'scaleX(0) scaleY(1.05)' : 'scaleX(1) scaleY(1)')};
  opacity: ${props => (props.$isFlipped ? 0 : 1)};

  @keyframes flipBackOut {
    from {
      transform: scaleX(1) scaleY(1);
      opacity: 1;
    }
    to {
      transform: scaleX(0) scaleY(1.05);
      opacity: 1;
    }
  }

  &::after {
    content: '?';
    color: rgba(255, 255, 255, 0.3);
    font-size: 4rem;
    font-weight: bold;
  }
`

const RevealedStack = styled.div<{ $totalCards: number }>`
  position: absolute;
  left: ${props => {
    // Adjust start position based on total cards to keep them centered
    const baseOffset = -220
    const cardSpacing = 15
    const totalWidth = (props.$totalCards - 1) * cardSpacing
    return `${baseOffset - totalWidth / 2}px`
  }};
  top: 0;
  width: 400px; // Give room for multiple cards
  height: 252px;
  pointer-events: none;
`

const RevealedCard = styled.div<{
  $index: number
  $showAsGrid: boolean
  $totalCards: number
}>`
  position: absolute;
  top: ${props => {
    if (!props.$showAsGrid) return '0'

    // For 9 cards, use 5-4 layout
    if (props.$totalCards === 9) {
      const row = props.$index < 5 ? 0 : 1
      const originalCardHeight = 252
      const gap = -60 // Negative gap to match horizontal spacing
      const totalHeight = 2 * originalCardHeight + gap
      return `${row * (originalCardHeight + gap) - totalHeight / 2 + originalCardHeight / 2}px`
    }

    // For 3 and 6 cards, use standard grid
    const columns = props.$totalCards <= 3 ? props.$totalCards : 3
    const row = Math.floor(props.$index / columns)
    const rows = Math.ceil(props.$totalCards / columns)
    const originalCardHeight = 252
    const gap = props.$totalCards <= 3 ? 40 : 30
    const totalHeight = rows * (originalCardHeight + gap) - gap
    return `${row * (originalCardHeight + gap) - totalHeight / 2 + originalCardHeight / 2}px`
  }};
  left: ${props => {
    if (!props.$showAsGrid) return `${props.$index * 15}px`

    const originalCardWidth = 180
    const baseOffset = 220 // RevealedStack is offset by -220px
    const cardSpacing = 15
    const stackOffset = ((props.$totalCards - 1) * cardSpacing) / 2 // Account for stack centering

    // For 9 cards, use 5-4 layout
    if (props.$totalCards === 9) {
      const gap = -60 // Much tighter spacing for 55% scaled cards
      const isTopRow = props.$index < 5
      const cardsInRow = isTopRow ? 5 : 4
      const colIndex = isTopRow ? props.$index : props.$index - 5
      const totalWidth = cardsInRow * originalCardWidth + (cardsInRow - 1) * gap
      const gridLeft = colIndex * (originalCardWidth + gap) - totalWidth / 2 + originalCardWidth / 2
      return `${gridLeft + baseOffset + stackOffset}px`
    }

    // For 3 and 6 cards, use standard grid
    const columns = props.$totalCards <= 3 ? props.$totalCards : 3
    const col = props.$index % columns
    const gap = props.$totalCards <= 3 ? 40 : 30
    const totalWidth = columns * (originalCardWidth + gap) - gap
    const gridLeft = col * (originalCardWidth + gap) - totalWidth / 2 + originalCardWidth / 2

    return `${gridLeft + baseOffset + stackOffset}px`
  }};
  transform: ${props => {
    if (!props.$showAsGrid) return 'scale(1)'
    // Different scales based on card count
    if (props.$totalCards <= 3) return 'scale(1)' // No scaling for 3 cards
    if (props.$totalCards <= 6) return 'scale(0.75)' // 75% for 6 cards
    return 'scale(0.55)' // 55% for 9 cards
  }};
  transform-origin: center center;
  transition:
    all 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => (props.$showAsGrid ? `${props.$index * 0.1}s` : '0s')};
`

export const CardStack = forwardRef<CardStackHandle, CardStackProps>(
  (
    {
      cards,
      currentCardIndex,
      onStackClick,
      onCardValueRevealed,
      revealedCards,
      totalCards,
      showAsGrid = false,
      sleeveRemoved = false,
      autoOpen = false,
      iconSize = 1.0,
    },
    ref
  ) => {
    const { playSound } = useCardsSound()
    const remainingCards = cards.slice(currentCardIndex)
    const topCard = remainingCards[0]
    const [isFlipping, setIsFlipping] = React.useState(false)
    const [isSliding, setIsSliding] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const [localCardRevealed, setLocalCardRevealed] = React.useState(false)
    const [showPrice, setShowPrice] = React.useState(false)

    const handleStackClick = () => {
      // Prevent clicks during any animation or if no cards left
      if (!topCard || isAnimating || topCard.isRevealed) return

      // Play simple card flip sound
      playSound('cardFlip')

      // Start the full animation sequence
      setIsAnimating(true)
      setIsFlipping(true)

      // Flip animation - reveal the card locally
      setTimeout(() => {
        setLocalCardRevealed(true)
      }, 200)

      // Clear flipping state after flip completes and show price
      setTimeout(() => {
        setIsFlipping(false)
        setShowPrice(true) // Show price after flip completes
        // Notify parent about card value being revealed
        if (onCardValueRevealed && topCard?.value) {
          onCardValueRevealed(topCard.value)
        }
      }, 400)

      // After flip completes, wait then slide
      setTimeout(() => {
        setIsSliding(true)
        // Keep price visible during slide

        // After slide animation completes, notify parent once
        setTimeout(() => {
          setShowPrice(false) // Hide price after slide completes
          // Single notification to parent after entire animation sequence
          onStackClick()
          // Reset local states
          setIsSliding(false)
          setLocalCardRevealed(false)
          setIsAnimating(false)
        }, 400)
      }, 600) // 400ms flip + 200ms pause
    }

    // Expose triggerClick function via ref
    useImperativeHandle(
      ref,
      () => ({
        triggerClick: handleStackClick,
      }),
      [handleStackClick]
    )

    return (
      <StackContainer $sleeveRemoved={sleeveRemoved}>
        {/* Remaining cards stack container */}
        <MainStack
          onClick={remainingCards.length > 0 && !autoOpen ? handleStackClick : undefined}
          $isAnimating={isAnimating}
        >
          {/* Revealed cards stack - always show if there are revealed cards */}
          {revealedCards.length > 0 && (
            <RevealedStack $totalCards={totalCards}>
              {revealedCards.map((card, index) => (
                <RevealedCard
                  key={card.id}
                  $index={index}
                  $showAsGrid={showAsGrid}
                  $totalCards={totalCards}
                >
                  <Card
                    name={card.name}
                    value={card.value}
                    icon={card.icon}
                    isRevealed={true}
                    size='dynamic'
                    width={180}
                    height={252}
                    hidePrice={!showAsGrid || index > revealedCards.length - 1}
                    tier={card.tier}
                    tierColor={card.tierColor}
                    iconSize={iconSize}
                  />
                </RevealedCard>
              ))}
            </RevealedStack>
          )}

          {remainingCards.length > 0 &&
            remainingCards.map((card, index) => (
              <StackedCard
                key={card.id}
                $index={index}
                $totalCards={remainingCards.length}
                $revealedCount={revealedCards.length}
                $totalCardsInPack={totalCards}
                $isFlipping={index === 0 && isFlipping}
                $isFlipped={index === 0 && localCardRevealed}
                $isSliding={index === 0 && isSliding && localCardRevealed}
              >
                {index === 0 ?
                  <HoverScale $enable={!isSliding}>
                    <CardBack $isFlipped={localCardRevealed} $isFlipping={isFlipping} />
                    <CardFront $isFlipped={localCardRevealed} $isFlipping={isFlipping}>
                      <Card
                        name={card.name}
                        value={card.value}
                        icon={card.icon}
                        isRevealed={true}
                        size='dynamic'
                        width={180}
                        height={252}
                        hidePrice={!showPrice} // Show price after flip, hide during slide
                        tier={card.tier}
                        tierColor={card.tierColor}
                        iconSize={iconSize}
                      />
                    </CardFront>
                  </HoverScale>
                : <>
                    <CardBack $isFlipped={false} $isFlipping={false} />
                    <CardFront $isFlipped={false} $isFlipping={false}>
                      <Card
                        name={card.name}
                        value={card.value}
                        icon={card.icon}
                        isRevealed={true}
                        size='dynamic'
                        width={180}
                        height={252}
                        hidePrice={true}
                        tier={card.tier}
                        tierColor={card.tierColor}
                        iconSize={iconSize}
                      />
                    </CardFront>
                  </>
                }
              </StackedCard>
            ))}
        </MainStack>
      </StackContainer>
    )
  }
)
