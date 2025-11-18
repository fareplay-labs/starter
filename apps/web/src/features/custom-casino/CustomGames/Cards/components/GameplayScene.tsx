// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { styled } from 'styled-components'
import CountUp from 'react-countup'
import { PackSleeve, type PackSleeveHandle } from './PackSleeve'
import { CardStack, type CardStackHandle } from './CardStack'
import { PackDisplay } from './PackDisplay'
import { useCardsGameStore } from '../store/CardsGameStore'
import { useCardsSound } from '../hooks/useCardsSound'
import { ANIMATION_DELAYS } from '../constants/animationDelays'
import { formatCardValue, getDecimalPlaces } from '../utils/formatUtils'
import { useCardsScaling } from '../hooks/useCardsScaling'

interface GameplaySceneProps {
  selectedPack?: number
}

const SceneContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const GridWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`

const ScaledContainer = styled.div<{ $scale: number }>`
  transform: scale(${props => props.$scale});
  transform-origin: center;
  position: relative;
`

const GameContent = styled.div`
  width: 800px;
  height: 600px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PreviewContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transform: ${props => (props.$isVisible ? 'translateY(0)' : 'translateY(-100%)')};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => (props.$isVisible ? 'auto' : 'none')};
`

const TotalValueDisplay = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100; // Ensure it's above other elements
`

const TotalValue = styled.div<{ $isPositive: boolean }>`
  font-weight: bold;
  color: ${props => (props.$isPositive ? '#4ade80' : '#f87171')};
  opacity: 1;
  transition: color 0.3s ease;
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
`

const PrefixText = styled.span`
  font-size: 2rem;
  opacity: 0.8;
  font-weight: 600;
`

const AmountWrapper = styled.span`
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;

  /* Override any CountUp component styles */
  * {
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
  }
`

const FloatingIncrement = styled.div<{ $isPositive: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => (props.$isPositive ? '#4ade80' : '#ef4444')};
  opacity: 0;
  animation: floatUp 1.5s ease-out forwards;
  pointer-events: none;

  @keyframes floatUp {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(0);
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`

type InternalGameState = 'idle' | 'sleeve' | 'opening' | 'cards' | 'results'

export const GameplayScene: React.FC<GameplaySceneProps> = ({
  selectedPack: selectedPackProp,
}) => {
  const {
    gameState,
    selectedPack: selectedPackFromStore,
    isPackOpening,
    revealedCards: draws,
    currentRevealIndex,
    revealNextCard,
    parameters,
    lastResult,
    autoOpen,
  } = useCardsGameStore()

  const selectedPack = selectedPackProp ?? selectedPackFromStore ?? 0
  const { playSound } = useCardsSound()

  // Hook for responsive scaling
  const { scale, wrapperRef, contentRef } = useCardsScaling()

  const [internalState, setInternalState] = useState<InternalGameState>('idle')
  const [sleeveOpen, setSleeveOpen] = useState(false)
  const [sleeveRemoved, setSleeveRemoved] = useState(false)
  const [sleeveReady, setSleeveReady] = useState(false)
  const [gridMode, setGridMode] = useState(false)

  // Refs for component handles
  const sleeveRef = useRef<PackSleeveHandle>(null)
  const cardStackRef = useRef<CardStackHandle>(null)

  // Refs for auto-play timers
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cardFlipIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      if (cardFlipIntervalRef.current) {
        clearInterval(cardFlipIntervalRef.current)
        cardFlipIntervalRef.current = null
      }
    }
  }, [])

  // Auto-play orchestration
  useEffect(() => {
    if (autoOpen && gameState === 'PLAYING' && sleeveReady && !isPackOpening && sleeveRef.current) {
      // Clear any existing timers
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)

      // Start auto-cut after initial delay
      autoPlayTimerRef.current = setTimeout(() => {
        sleeveRef.current?.triggerAutoCut()
      }, ANIMATION_DELAYS.INITIAL_DELAY)
    }

    // Cleanup on state change
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [autoOpen, gameState, sleeveReady, isPackOpening])

  // Auto-flip cards when sleeve is removed
  useEffect(() => {
    if (autoOpen && sleeveRemoved && cardStackRef.current && draws && draws.length > 0) {
      // Clear any existing timers
      if (cardFlipIntervalRef.current) clearInterval(cardFlipIntervalRef.current)
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)

      // Start flipping cards after a delay
      autoPlayTimerRef.current = setTimeout(() => {
        let flipsCompleted = 0
        const totalCards = draws.length

        const flipNextCard = () => {
          // Check if we still have cards to flip based on remainingCards
          const cardsRemaining = totalCards - flipsCompleted

          if (cardsRemaining > 0 && cardStackRef.current) {
            cardStackRef.current.triggerClick()
            flipsCompleted++

            // Check if we're done after this flip
            if (flipsCompleted >= totalCards) {
              // Clear the interval after a delay to allow the last card animation to complete
              setTimeout(() => {
                if (cardFlipIntervalRef.current) {
                  clearInterval(cardFlipIntervalRef.current)
                  cardFlipIntervalRef.current = null
                }
              }, 100)
            }
          } else {
            // Failsafe: clear interval if no more cards
            if (cardFlipIntervalRef.current) {
              clearInterval(cardFlipIntervalRef.current)
              cardFlipIntervalRef.current = null
            }
          }
        }

        // Start interval for card flipping
        cardFlipIntervalRef.current = setInterval(flipNextCard, ANIMATION_DELAYS.CARD_FLIP_INTERVAL)
        // Flip first card immediately
        flipNextCard()
      }, ANIMATION_DELAYS.PRE_FLIP_DELAY)
    }

    // Cleanup
    return () => {
      if (cardFlipIntervalRef.current) {
        clearInterval(cardFlipIntervalRef.current)
        cardFlipIntervalRef.current = null
      }
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [autoOpen, sleeveRemoved, draws])

  // Start and progress internal animation states based on store game state
  useEffect(() => {
    if (gameState === 'PLAYING' && internalState === 'idle') {
      setInternalState('sleeve')
      setSleeveOpen(false)
      setSleeveRemoved(false)
      setSleeveReady(false)
      // Sleeve animation takes 0.6s, wait for it to fully complete
      setTimeout(() => setSleeveReady(true), 1500)
    } else if (gameState === 'PLAYING' && internalState === 'sleeve' && !isPackOpening) {
      // Pack opening finished, move to cards
      setInternalState('cards')
    } else if (gameState === 'SHOWING_RESULT') {
      setInternalState('results')
      // Clear any auto-play timers
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      if (cardFlipIntervalRef.current) {
        clearInterval(cardFlipIntervalRef.current)
        cardFlipIntervalRef.current = null
      }
    } else if (gameState === 'RESETTING') {
      // Keep showing results during reset transition
      // Don't change internal state yet
    } else if (gameState === 'IDLE') {
      setInternalState('idle')
      setSleeveOpen(false)
      setSleeveRemoved(false)
      setSleeveReady(false)
      // Clear any auto-play timers
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
      if (cardFlipIntervalRef.current) {
        clearInterval(cardFlipIntervalRef.current)
        cardFlipIntervalRef.current = null
      }
    }
  }, [gameState, internalState, isPackOpening])

  // Track if we've played the card display sound for this result
  const hasPlayedDisplaySound = useRef(false)
  const hasPlayedOutcomeSound = useRef(false)

  // Defer grid layout switch to next frames so the last revealed card animates from stack to grid
  useEffect(() => {
    let r1: number | null = null
    let r2: number | null = null

    if (gameState === 'SHOWING_RESULT' || internalState === 'results') {
      setGridMode(false)
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          setGridMode(true)
          // Play sound once when entering grid mode, but don't block animation
          if (!hasPlayedDisplaySound.current) {
            hasPlayedDisplaySound.current = true
            // Delay sound slightly to not interfere with animation
            setTimeout(() => playSound('cardDisplay'), 50)
          }
        })
      })
    } else {
      setGridMode(false)
      // Reset the flag when not showing results
      hasPlayedDisplaySound.current = false
      hasPlayedOutcomeSound.current = false
    }

    return () => {
      if (r1 !== null) cancelAnimationFrame(r1)
      if (r2 !== null) cancelAnimationFrame(r2)
    }
  }, [gameState, internalState, playSound])

  // Play outcome sound (win/lose) once when results show
  useEffect(() => {
    if (gameState === 'SHOWING_RESULT' && lastResult && !hasPlayedOutcomeSound.current) {
      hasPlayedOutcomeSound.current = true
      const outcomeKey = lastResult.isWin ? 'win' : 'lose'
      // small delay to layer under grid transition, keep separate from cardDisplay
      setTimeout(() => playSound(outcomeKey), 120)
    }
  }, [gameState, lastResult, playSound])

  // Build display data from store draws and catalog
  const catalog = parameters?.cardsCatalog || []
  const totalCards = Array.isArray(draws) ? draws.length : 0
  const revealedCount = Math.max(currentRevealIndex + 1, 0)
  const remaining = Math.max(totalCards - revealedCount, 0)

  // Helper function to get tier color
  const getTierColor = (tier?: string) => {
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
  }

  const remainingCards = (draws || []).slice(revealedCount).map((d, idx) => {
    // Try different property names that might contain the card ID
    const cardId = d.catalogId
    const c = catalog.find(ci => ci.id === cardId)
    const tier = c?.tier as 'common' | 'rare' | 'epic' | 'legendary' | undefined
    return {
      id: cardId * 1000 + idx,
      name: c?.name || `Card ${cardId}`,
      value: d.value,
      icon: c?.iconUrl || undefined,
      isRevealed: false, // Cards start unrevealed, CardStack manages reveal animation
      tier: tier,
      tierColor: getTierColor(tier),
    }
  })

  const revealedCards = (draws || []).slice(0, revealedCount).map((d, idx) => {
    const cardId = d.catalogId
    const c = catalog.find(ci => ci.id === cardId)
    const tier = c?.tier as 'common' | 'rare' | 'epic' | 'legendary' | undefined
    return {
      id: cardId * 10 + idx,
      name: c?.name || `Card ${cardId}`,
      value: d.value,
      icon: c?.iconUrl || undefined,
      tier: tier,
      tierColor: getTierColor(tier),
    }
  })

  // Calculate running total from revealed cards
  const runningTotal = useMemo(() => {
    return revealedCards.reduce((sum, card) => sum + (card.value || 0), 0)
  }, [revealedCards])

  // State for animated total
  const [displayTotal, setDisplayTotal] = useState(0)

  // State for floating increments
  const [floatingIncrements, setFloatingIncrements] = useState<
    Array<{ id: number; value: number }>
  >([])
  const [incrementIdCounter, setIncrementIdCounter] = useState(0)

  useEffect(() => {
    // Update display total when running total changes or when showing results
    if (gameState === 'PLAYING') {
      setDisplayTotal(runningTotal)
    } else if (gameState === 'SHOWING_RESULT' && lastResult) {
      setDisplayTotal(lastResult.payout)
    }
  }, [runningTotal, gameState, lastResult])

  // Add floating increment when a card is revealed
  useEffect(() => {
    if (revealedCards.length > 0 && gameState === 'PLAYING') {
      const lastCard = revealedCards[revealedCards.length - 1]
      if (lastCard?.value) {
        const newIncrement = { id: incrementIdCounter, value: lastCard.value }
        setFloatingIncrements(prev => [...prev, newIncrement])
        setIncrementIdCounter(prev => prev + 1)

        // Remove the increment after animation completes
        setTimeout(() => {
          setFloatingIncrements(prev => prev.filter(inc => inc.id !== newIncrement.id))
        }, 1500)
      }
    }
  }, [revealedCards.length, gameState])

  const handleSleeveClick = () => {
    // purely visual open; store controls isPackOpening
    setSleeveOpen(true)
  }

  const handleStackClick = () => {
    if (remaining <= 0) return

    // Guard against revealing during pack opening
    if (isPackOpening) return

    // This is called once after the full animation sequence completes
    // Just advance to the next card
    revealNextCard()
  }

  return (
    <SceneContainer>
      <GridWrapper ref={wrapperRef}>
        <ScaledContainer $scale={scale}>
          <GameContent ref={contentRef}>
            {/* Preview/Idle state */}
            <PreviewContainer $isVisible={gameState === 'IDLE'}>
              <PackDisplay />
            </PreviewContainer>

            {/* Card Stack - rendered after sleeve has animated in, stays for results */}
            {((gameState === 'PLAYING' && sleeveReady) || gameState === 'SHOWING_RESULT') && (
              <CardStack
                ref={cardStackRef}
                cards={remainingCards}
                currentCardIndex={0}
                onStackClick={handleStackClick}
                revealedCards={revealedCards}
                totalCards={totalCards}
                showAsGrid={gridMode}
                sleeveRemoved={sleeveRemoved || gameState === 'SHOWING_RESULT'}
                autoOpen={autoOpen}
                iconSize={parameters.iconSize}
              />
            )}

            {/* Pack Sleeve rendered on top of stack */}
            <PackSleeve
              ref={sleeveRef}
              packType={selectedPack}
              isVisible={gameState === 'PLAYING'}
              isOpen={sleeveOpen || isPackOpening}
              onClick={handleSleeveClick}
              onCutComplete={() => setSleeveRemoved(true)}
            />
          </GameContent>
        </ScaledContainer>
      </GridWrapper>

      {/* Total value display during playing and results */}
      {(gameState === 'PLAYING' ||
        gameState === 'SHOWING_RESULT' ||
        internalState === 'results') && (
        <TotalValueDisplay>
          <TotalValue $isPositive={displayTotal > (lastResult?.entryAmount ?? 0)}>
            <PrefixText>+$</PrefixText>
            <AmountWrapper>
              <CountUp
                end={displayTotal}
                decimals={getDecimalPlaces(displayTotal)}
                duration={0.8}
                preserveValue={true}
                separator=','
                useEasing={true}
              />
            </AmountWrapper>
          </TotalValue>
          {/* Floating increments */}
          {floatingIncrements.map(inc => (
            <FloatingIncrement key={inc.id} $isPositive={inc.value > 0}>
              +${formatCardValue(inc.value)}
            </FloatingIncrement>
          ))}
        </TotalValueDisplay>
      )}
    </SceneContainer>
  )
}
