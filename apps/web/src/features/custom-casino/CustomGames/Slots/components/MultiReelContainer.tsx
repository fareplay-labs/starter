// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { SimpleReel } from './SimpleReel'
import { ReelOrchestrator } from '../animations/ReelOrchestrator'
import {
  type ReelCommand,
  type ReelState,
  type AnimationType,
  type DirectionMode,
  type ReelOrder,
  generateReelDirections,
  generateStopOrder,
} from '../animations/strategies'
import { analyzeResult } from '../utils/winDetection'
import { type SpinDirection } from '../animations'
import { extractAlpha, generateBoxShadow } from '../utils/colorUtils'
import { type SlotSymbol } from '../types'
import { spinSoundManager } from '../utils/SpinSoundManager'
import { selectRandomDirection, selectRandomReelOrder } from '../utils/randomSelection'

const Container = styled.div<{
  $background?: string
  $borderColor?: string
  $boxShadow?: string
  $gap: number
  $padding: number
}>`
  display: flex;
  gap: ${props => props.$gap}px;
  padding: ${props => props.$padding}px;
  background: ${props => props.$background || '#2c3e50'};
  border-radius: 12px;
  border: 3px solid ${props => props.$borderColor || '#1a1a2e'};
  box-shadow: ${props =>
    props.$boxShadow || 'inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)'};
`

const ReelWrapper = styled.div<{ $shadowOpacity: number }>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, ${props => 0.2 * props.$shadowOpacity}) 0%,
      transparent 15%,
      transparent 85%,
      rgba(0, 0, 0, ${props => 0.2 * props.$shadowOpacity}) 100%
    );
    pointer-events: none;
    z-index: 2;
    border-radius: 8px; /* Match the reel border radius */
  }
`

interface MultiReelContainerProps {
  symbols: SlotSymbol[]
  isSpinning: boolean
  targetPositions: number[] | null
  onReelStop: (reelIndex: number) => void
  onAllReelsStopped: () => void
  direction?: SpinDirection
  directionMode?: DirectionMode
  reelOrder?: ReelOrder
  animationType?: AnimationType
  forcedStrategy?: string
  // Constraint arrays for orchestrator to choose from
  allowedStrategies?: string[]
  allowedDirections?: string[]
  allowedStopOrders?: string[]
  debugMode?: boolean
  reelBackground?: string
  reelContainer?: string
  borderColor?: string
  paylineIndicator?: string
  iconSize?: number
  gameScale?: number
  isWinning?: boolean
  winTier?: 'small' | 'medium' | 'large' | 'mega'
  synthConfig?: import('../types').SynthConfig
}

interface ReelAnimationState {
  animationType: AnimationType
  isSpinning: boolean
  targetPosition: number | null
  direction: SpinDirection
}

export const MultiReelContainer: React.FC<MultiReelContainerProps> = ({
  symbols,
  isSpinning,
  targetPositions,
  onReelStop,
  onAllReelsStopped,
  direction = 'forward',
  directionMode = 'forward',
  reelOrder = 'sequential',
  animationType,
  forcedStrategy = 'auto',
  allowedStrategies,
  allowedDirections,
  allowedStopOrders,
  reelBackground,
  reelContainer,
  borderColor,
  paylineIndicator,
  iconSize = 1.0,
  gameScale = 1.0,
  isWinning = false,
  winTier,
  synthConfig,
}) => {
  const REEL_COUNT = 5
  const orchestratorRef = useRef<ReelOrchestrator | null>(null)
  const [reelStates, setReelStates] = useState<ReelAnimationState[]>(
    Array(REEL_COUNT)
      .fill(null)
      .map(() => ({
        animationType: 'basic' as AnimationType,
        isSpinning: false,
        targetPosition: null,
        direction: 'forward' as SpinDirection,
      }))
  )
  const stoppedReelsRef = useRef<Set<number>>(new Set())

  // Determine which reels are part of winning combinations
  const winningReelIndices = useMemo(() => {
    const winningReels = new Set<number>()

    // Only check when we have target positions and a win
    if (isWinning && targetPositions && targetPositions.length === REEL_COUNT) {
      // Check the center payline for matching symbol indices
      const centerIndices = targetPositions.map(pos => pos % symbols.length)

      // Count consecutive matches from the start (using indices, not values)
      const firstIndex = centerIndices[0]
      let matchCount = 1

      for (let i = 1; i < centerIndices.length; i++) {
        if (centerIndices[i] === firstIndex) {
          matchCount++
        } else {
          break
        }
      }

      // Mark winning reels (consecutive matches from the start)
      if (matchCount >= 3) {
        for (let i = 0; i < matchCount; i++) {
          winningReels.add(i)
        }
      }
    }

    return winningReels
  }, [isWinning, targetPositions, symbols, REEL_COUNT])

  // Apply synth config to sound manager
  useEffect(() => {
    if (synthConfig) {
      spinSoundManager.setSynthConfig(synthConfig)
    }
  }, [synthConfig])

  // Initialize orchestrator
  useEffect(() => {
    orchestratorRef.current = new ReelOrchestrator({
      reelCount: REEL_COUNT,
      onReelCommand: handleReelCommand,
      onStateChange: handleStateChange,
    })

    return () => {
      orchestratorRef.current?.destroy()
      spinSoundManager.stopAll() // Cleanup sounds on unmount
    }
  }, [])

  // Handle reel commands from orchestrator
  const handleReelCommand = useCallback((command: ReelCommand) => {
    // Received command from orchestrator

    setReelStates(prev => {
      const newStates = [...prev]
      const state = newStates[command.reelIndex]

      switch (command.type) {
        case 'start':
          state.animationType = command.animation || 'steady'
          state.isSpinning = true
          state.targetPosition = null
          break

        case 'transition':
          state.animationType = command.animation || 'basic'
          break

        case 'stop':
          state.targetPosition = command.targetPosition ?? null
          state.isSpinning = false
          break

        case 'reset':
          state.animationType = 'basic'
          state.isSpinning = false
          state.targetPosition = null
          break
      }

      return newStates
    })
  }, [])

  // Handle state changes from orchestrator
  const handleStateChange = useCallback((_states: ReelState[]) => {
    // State change from orchestrator
  }, [])

  // Handle individual reel stop
  const handleReelStop = useCallback(
    (reelIndex: number) => {
      // Reel stopped

      stoppedReelsRef.current.add(reelIndex)
      onReelStop(reelIndex)

      // Check if all reels have stopped
      if (stoppedReelsRef.current.size === REEL_COUNT) {
        // All reels stopped
        stoppedReelsRef.current.clear()
        onAllReelsStopped()
      }
    },
    [onReelStop, onAllReelsStopped, REEL_COUNT]
  )

  // Start spinning
  useEffect(() => {
    if (isSpinning && orchestratorRef.current) {
      // Randomly select direction mode from allowed options
      const selectedDirectionMode =
        allowedDirections?.length ? selectRandomDirection(allowedDirections)
        : direction === 'backward' ? 'backward'
        : directionMode || 'forward'

      // Starting spin
      stoppedReelsRef.current.clear()

      // Generate directions for each reel based on selected mode
      const directions = generateReelDirections(REEL_COUNT, selectedDirectionMode)

      // Update reel states with directions
      setReelStates(prev =>
        prev.map((state, index) => ({
          ...state,
          direction: directions[index] || 'forward',
        }))
      )

      orchestratorRef.current.startSpin()
    }
  }, [isSpinning, directionMode, direction, REEL_COUNT, allowedDirections])

  // Process result when target positions are received
  useEffect(() => {
    if (targetPositions && targetPositions.length === REEL_COUNT && orchestratorRef.current) {
      // Processing result with target positions

      // Analyze the result
      const analysis = analyzeResult(targetPositions, symbols)

      // Log the outcome symbols @TODO: Remove for production
      const outcomeSymbols = targetPositions
        .map((pos) => {
          const symbol = symbols[pos]
          if (typeof symbol === 'string') {
            return symbol
          } else if (symbol && typeof symbol === 'object' && 'url' in symbol) {
            // For image symbols, show position and that it's an image
            return `[img${pos}]`
          } else {
            // Fallback - this shouldn't happen with valid data
            return `[?${pos}]`
          }
        })
        .join(' ')
      console.log(`[Slots] Result: ${outcomeSymbols} (positions: ${targetPositions.join(',')})`)

      // Generate stop order - randomly select from allowed options or use default
      const selectedStopOrder =
        allowedStopOrders?.length ? selectRandomReelOrder(allowedStopOrders) : reelOrder
      const stopOrder = generateStopOrder(REEL_COUNT, selectedStopOrder)

      // Let orchestrator handle the animation strategy with constraints
      // Pass the original positions (not reordered) and the stop order separately
      orchestratorRef.current.processResult(targetPositions, analysis, {
        animationType: animationType ? (animationType as AnimationType) : undefined,
        stopOrder,
        forcedStrategy: forcedStrategy !== 'auto' ? forcedStrategy : undefined,
        // Pass constraint arrays for intelligent selection
        allowedStrategies,
        allowedDirections,
        allowedStopOrders,
      })
    }
  }, [
    targetPositions,
    symbols,
    REEL_COUNT,
    reelOrder,
    animationType,
    forcedStrategy,
    allowedStrategies,
    allowedDirections,
    allowedStopOrders,
  ])

  // Calculate box shadow based on border color alpha
  const borderAlpha = extractAlpha(borderColor || '#1a1a2e')
  const containerBoxShadow = generateBoxShadow(borderAlpha, true)

  // Log for debugging
  useEffect(() => {
    console.log('[MultiReelContainer] Border color changed:', borderColor, 'Alpha:', borderAlpha)
  }, [borderColor, borderAlpha])

  // Calculate scaled dimensions
  const containerGap = 10 * gameScale
  const containerPadding = 20 * gameScale

  return (
    <Container
      $background={reelContainer}
      $borderColor={borderColor}
      $boxShadow={containerBoxShadow}
      $gap={containerGap}
      $padding={containerPadding}
    >
      {reelStates.map((state, index) => (
        <ReelWrapper key={index} $shadowOpacity={borderAlpha}>
          <SimpleReel
            reelIndex={index}
            symbols={symbols}
            targetPosition={state.targetPosition}
            isSpinning={state.isSpinning}
            onStop={() => handleReelStop(index)}
            animationType={state.animationType}
            direction={state.direction}
            reelBackground={reelBackground}
            borderColor={borderColor}
            paylineIndicator={paylineIndicator}
            iconSize={iconSize}
            gameScale={gameScale}
            isWinning={winningReelIndices.has(index)}
            winTier={winTier}
          />
        </ReelWrapper>
      ))}
    </Container>
  )
}
