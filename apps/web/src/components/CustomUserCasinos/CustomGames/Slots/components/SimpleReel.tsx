// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { motion, useAnimate } from 'framer-motion'
import {
  reelAnimations,
  defaultAnimation,
  type AnimationState,
  type SpinDirection,
} from '../animations'
import { extractAlpha, generateBoxShadow } from '../utils/colorUtils'
import { type SlotSymbol } from '../types'
import { isEmojiValue } from '@/components/CustomUserCasinos/CustomGames/shared/utils/emojiUtils'
import { getImageUrl } from '@/components/CustomUserCasinos/shared/utils/cropDataUtils'
import { spinSoundManager } from '../utils/SpinSoundManager'

interface SimpleReelProps {
  symbols: SlotSymbol[]
  targetPosition: number | null
  isSpinning: boolean
  onStop: () => void
  reelIndex: number
  animationType?: string // Optional animation type
  direction?: SpinDirection // Optional spin direction
  reelBackground?: string // Background color/gradient for the reel
  borderColor?: string // Border color for the reel
  paylineIndicator?: string // Color for the center payline
  iconSize?: number // Size scaling for icons (0.7 to 2.0)
  gameScale?: number // Overall game scale (0.7 to 1.4)
  isWinning?: boolean // Whether this reel is part of a winning combination
  winTier?: 'small' | 'medium' | 'large' | 'mega' // The tier of the win
  synthConfig?: import('../types').SynthConfig // Synthesizer configuration
}

const ReelContainer = styled.div<{
  $background?: string
  $borderColor?: string
  $boxShadow?: string
  $width: number
  $height: number
}>`
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  overflow: hidden;
  background: ${props => props.$background || '#0a0a1e'};
  border: 2px solid ${props => props.$borderColor || '#1a1a2e'};
  border-radius: 8px;
  position: relative;
  box-shadow: ${props =>
    props.$boxShadow || 'inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'};
`

const SymbolContainer = styled.div<{
  $height: number
  $fontSize: number
  $iconSize?: number
  $isWinning?: boolean
  $winTier?: 'small' | 'medium' | 'large' | 'mega'
  $symbolIndex?: number
}>`
  width: 100%;
  height: ${props => props.$height}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$fontSize}px;
  position: relative;
  transition: transform 0.3s ease;

  ${props =>
    props.$isWinning &&
    `
    animation: ${
      props.$winTier === 'mega' ? 'megaSymbolWin'
      : props.$winTier === 'large' ? 'largeSymbolWin'
      : props.$winTier === 'medium' ? 'mediumSymbolWin'
      : 'smallSymbolWin'
    } ${
      props.$winTier === 'mega' ? '0.5s'
      : props.$winTier === 'large' ? '0.7s'
      : props.$winTier === 'medium' ? '1s'
      : '1.5s'
    } ease-in-out infinite;
    animation-delay: ${props.$symbolIndex ? props.$symbolIndex * 0.1 : 0}s;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${(props: any) => (props.$iconSize || 1) * 80}%;
      height: ${(props: any) => (props.$iconSize || 1) * 80}%;
      border-radius: 50%;
      background: radial-gradient(circle, 
        ${
          props.$winTier === 'mega' ? 'rgba(255, 0, 255, 0.3)'
          : props.$winTier === 'large' ? 'rgba(255, 215, 0, 0.3)'
          : props.$winTier === 'medium' ? 'rgba(255, 165, 0, 0.2)'
          : 'rgba(255, 215, 0, 0.1)'
        } 0%, 
        transparent 60%);
      pointer-events: none;
      z-index: -1;
      animation: glowPulse ${
        props.$winTier === 'mega' ? '0.5s'
        : props.$winTier === 'large' ? '0.7s'
        : '1s'
      } ease-in-out infinite;
    }
  `}

  @keyframes smallSymbolWin {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes mediumSymbolWin {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
    }
    25% {
      transform: scale(1.15) rotate(2deg);
    }
    50% {
      transform: scale(1.2) rotate(0deg);
    }
    75% {
      transform: scale(1.15) rotate(-2deg);
    }
  }

  @keyframes largeSymbolWin {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      filter: brightness(1);
    }
    25% {
      transform: scale(1.2) rotate(5deg);
      filter: brightness(1.2);
    }
    50% {
      transform: scale(1.3) rotate(0deg);
      filter: brightness(1.3);
    }
    75% {
      transform: scale(1.2) rotate(-5deg);
      filter: brightness(1.2);
    }
  }

  @keyframes megaSymbolWin {
    0% {
      transform: scale(1) rotate(0deg);
      filter: brightness(1) hue-rotate(0deg);
    }
    25% {
      transform: scale(1.3) rotate(10deg);
      filter: brightness(1.4) hue-rotate(90deg);
    }
    50% {
      transform: scale(1.4) rotate(0deg);
      filter: brightness(1.5) hue-rotate(180deg);
    }
    75% {
      transform: scale(1.3) rotate(-10deg);
      filter: brightness(1.4) hue-rotate(270deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      filter: brightness(1) hue-rotate(360deg);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
`

const SymbolImageWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform-origin: center;
`

const SymbolImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
`

const CenterLine = styled.div<{
  $color?: string
  $isWinning?: boolean
  $winTier?: 'small' | 'medium' | 'large' | 'mega'
}>`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: ${props => props.$color || 'rgba(255, 215, 0, 0.3)'};
  pointer-events: none;
  z-index: 10;
  transition: all 0.3s ease;

  ${props =>
    props.$isWinning &&
    `
    height: 3px;
    animation: ${
      props.$winTier === 'mega' ? 'megaWinPulse'
      : props.$winTier === 'large' ? 'largeWinPulse'
      : props.$winTier === 'medium' ? 'mediumWinPulse'
      : 'smallWinPulse'
    } 
               ${
                 props.$winTier === 'mega' ? '0.5s'
                 : props.$winTier === 'large' ? '0.7s'
                 : props.$winTier === 'medium' ? '1s'
                 : '1.5s'
               } ease-in-out infinite;
    
    background: ${
      props.$winTier === 'mega' ? 'linear-gradient(90deg, #ff00ff, #00ffff, #ffff00, #ff00ff)'
      : props.$winTier === 'large' ? 'linear-gradient(90deg, #ffd700, #ff6347, #ffd700)'
      : props.$winTier === 'medium' ? 'linear-gradient(90deg, #ffd700, #ffa500, #ffd700)'
      : '#ffd700'
    };
    
    background-size: ${props.$winTier === 'mega' || props.$winTier === 'large' ? '200% 100%' : '100% 100%'};
    
    box-shadow: 
      0 0 ${
        props.$winTier === 'mega' ? '20px'
        : props.$winTier === 'large' ? '15px'
        : props.$winTier === 'medium' ? '10px'
        : '5px'
      } 
      ${
        props.$winTier === 'mega' ? 'rgba(255, 255, 255, 0.8)'
        : props.$winTier === 'large' ? 'rgba(255, 215, 0, 0.8)'
        : props.$winTier === 'medium' ? 'rgba(255, 165, 0, 0.6)'
        : 'rgba(255, 215, 0, 0.4)'
      };
  `}

  @keyframes smallWinPulse {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes mediumWinPulse {
    0%,
    100% {
      opacity: 0.8;
      transform: scaleX(1);
    }
    50% {
      opacity: 1;
      transform: scaleX(1.02);
    }
  }

  @keyframes largeWinPulse {
    0%,
    100% {
      opacity: 0.8;
      transform: scaleX(1);
      background-position: 0% 50%;
    }
    50% {
      opacity: 1;
      transform: scaleX(1.05);
      background-position: 100% 50%;
    }
  }

  @keyframes megaWinPulse {
    0% {
      opacity: 0.8;
      transform: scaleX(1) scaleY(1);
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scaleX(1.1) scaleY(1.5);
      background-position: 100% 50%;
      filter: hue-rotate(180deg);
    }
    100% {
      opacity: 0.8;
      transform: scaleX(1) scaleY(1);
      background-position: 200% 50%;
      filter: hue-rotate(360deg);
    }
  }
`

// Helper component to render a single symbol
const Symbol: React.FC<{
  symbol: SlotSymbol
  index: number
  iconSize: number
  symbolHeight: number
  isWinning?: boolean
  winTier?: 'small' | 'medium' | 'large' | 'mega'
  symbolPosition?: number
}> = ({
  symbol,
  index,
  iconSize,
  symbolHeight,
  isWinning = false,
  winTier,
  symbolPosition = 0,
}) => {
  const [imageError, setImageError] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'wide' | 'tall' | 'square' | null>(null)

  // Calculate scaled sizes
  const fontSize = 36 * iconSize
  const imageSize = 40 * iconSize

  // Safety check for symbol
  if (!symbol) {
    return (
      <SymbolContainer
        $height={symbolHeight}
        $fontSize={fontSize}
        $iconSize={iconSize}
        $isWinning={isWinning}
        $winTier={winTier}
        $symbolIndex={symbolPosition}
      >
        ❓
      </SymbolContainer>
    )
  }

  // Use getImageUrl to extract the proper URL from any format
  const extractedValue = getImageUrl(symbol)

  // Check if it's an emoji
  const isEmoji = typeof extractedValue === 'string' && isEmojiValue(extractedValue)

  // If no valid content, show fallback
  if (!extractedValue) {
    return (
      <SymbolContainer
        $height={symbolHeight}
        $fontSize={fontSize}
        $iconSize={iconSize}
        $isWinning={isWinning}
        $winTier={winTier}
        $symbolIndex={symbolPosition}
      >
        ❓
      </SymbolContainer>
    )
  }

  // If image failed to load, show emoji fallback
  if (imageError && !isEmoji) {
    return (
      <SymbolContainer
        $height={symbolHeight}
        $fontSize={fontSize}
        $iconSize={iconSize}
        $isWinning={isWinning}
        $winTier={winTier}
        $symbolIndex={symbolPosition}
      >
        ❓
      </SymbolContainer>
    )
  }

  return (
    <SymbolContainer
      $height={symbolHeight}
      $fontSize={fontSize}
      $iconSize={iconSize}
      $isWinning={isWinning}
      $winTier={winTier}
      $symbolIndex={symbolPosition}
    >
      {isEmoji ?
        extractedValue
      : <SymbolImageWrapper style={{ width: `${imageSize}px`, height: `${imageSize}px` }}>
          <SymbolImage
            src={extractedValue}
            alt={`symbol-${index}`}
            style={{
              objectFit: aspectRatio === 'wide' ? 'cover' : 'contain'
            }}
            onError={_e => {
              console.error(`[Symbol ${index}] Failed to load image:`, extractedValue)
              setImageError(true)
            }}
            onLoad={(e) => {
              const img = e.currentTarget
              const ratio = img.naturalWidth / img.naturalHeight
              if (ratio > 1.2) {
                setAspectRatio('wide')
              } else if (ratio < 0.8) {
                setAspectRatio('tall')
              } else {
                setAspectRatio('square')
              }
            }}
          />
        </SymbolImageWrapper>
      }
    </SymbolContainer>
  )
}

export const SimpleReel: React.FC<SimpleReelProps> = ({
  symbols,
  targetPosition,
  isSpinning,
  onStop,
  reelIndex,
  animationType = defaultAnimation,
  direction = 'forward',
  reelBackground,
  borderColor,
  paylineIndicator,
  iconSize = 1.0,
  gameScale = 1.0,
  isWinning = false,
  winTier,
  synthConfig,
}) => {
  // Apply synth config to sound manager
  useEffect(() => {
    if (synthConfig) {
      spinSoundManager.setSynthConfig(synthConfig)
    }
  }, [synthConfig])

  // Calculate scaled dimensions
  const SYMBOL_HEIGHT = 60 * gameScale // Only scales with game scale, not icon size
  const REEL_WIDTH = 100 * gameScale
  const REEL_HEIGHT = 300 * gameScale // Fixed ratio with game scale

  // Framer Motion animation control
  const [scope, animate] = useAnimate()

  // State for current position
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0)

  // Refs for animation
  const animationFrameRef = useRef<number>()
  const isSpinningRef = useRef(false)
  const targetPositionRef = useRef<number | null>(null)
  const hasStoppedRef = useRef(false)
  const animationStateRef = useRef<AnimationState | null>(null)
  const currentOffsetRef = useRef(0) // Track offset without React state

  // Get the animation profile
  const animation = reelAnimations[animationType] || reelAnimations[defaultAnimation]
  const prevAnimationTypeRef = useRef(animationType)
  const animationRef = useRef(animation)

  // Keep animation ref up to date
  useEffect(() => {
    animationRef.current = animation
  }, [animation])

  // Create extended array for seamless looping
  const extendedSymbols: SlotSymbol[] = []
  for (let copy = 0; copy < 3; copy++) {
    for (let i = 0; i < symbols.length; i++) {
      extendedSymbols.push(symbols[i])
    }
  }

  // Animation loop using RAF
  const animateFrame = (timestamp: number) => {
    if (!animationStateRef.current || !scope.current) return

    // Calculate delta time in seconds
    const deltaTime = Math.min((timestamp - animationStateRef.current.lastFrameTime) / 1000, 0.1)
    animationStateRef.current.lastFrameTime = timestamp

    if (isSpinningRef.current && targetPositionRef.current === null) {
      // Free spinning
      const newOffset = animationRef.current.updateSpin(
        animationStateRef.current,
        symbols.length,
        SYMBOL_HEIGHT,
        deltaTime,
        direction
      )
      animationStateRef.current.pixelOffset = newOffset
      currentOffsetRef.current = newOffset

      // Update sound manager with current state
      spinSoundManager.updateReelState(
        reelIndex,
        animationStateRef.current.velocity,
        true,
        SYMBOL_HEIGHT,
        symbols.length
      )

      // Check for symbol passing payline (for click sounds)
      spinSoundManager.checkSymbolPass(reelIndex, newOffset, timestamp)

      // Calculate visual offset (center the middle copy of symbols)
      // REEL_HEIGHT / 2.5 centers the symbols in the viewport
      const middleCopyOffset = -symbols.length * SYMBOL_HEIGHT + REEL_HEIGHT / 2.5
      const visualOffset = newOffset + middleCopyOffset

      // Update transform directly via Framer Motion (no React re-render!)
      animate(
        scope.current,
        {
          y: visualOffset,
        },
        {
          duration: 0,
          ease: 'linear',
        }
      )

      animationFrameRef.current = requestAnimationFrame(animateFrame)
    } else if (targetPositionRef.current !== null && !hasStoppedRef.current) {
      // Stopping at target
      const target = targetPositionRef.current
      const targetPixelOffset = -target * SYMBOL_HEIGHT

      const result = animationRef.current.updateStop(
        animationStateRef.current,
        animationStateRef.current.pixelOffset,
        targetPixelOffset,
        symbols.length,
        SYMBOL_HEIGHT,
        deltaTime,
        direction
      )

      animationStateRef.current.pixelOffset = result.offset
      animationStateRef.current.velocity = result.velocity
      currentOffsetRef.current = result.offset

      // Update sound manager during deceleration
      spinSoundManager.updateReelState(
        reelIndex,
        result.velocity,
        true,
        SYMBOL_HEIGHT,
        symbols.length
      )

      // Continue checking for symbol clicks even during deceleration
      spinSoundManager.checkSymbolPass(reelIndex, result.offset, timestamp)

      // Calculate visual offset (center the middle copy of symbols)
      const middleCopyOffset = -symbols.length * SYMBOL_HEIGHT + REEL_HEIGHT / 2.5
      const visualOffset = result.offset + middleCopyOffset

      // Update transform directly
      animate(
        scope.current,
        {
          y: visualOffset,
        },
        {
          duration: 0,
          ease: 'linear',
        }
      )

      if (result.isComplete) {
        // Do one final animation to the exact position
        const finalMiddleCopyOffset = -symbols.length * SYMBOL_HEIGHT + REEL_HEIGHT / 2.5
        const finalVisualOffset = targetPixelOffset + finalMiddleCopyOffset

        animate(
          scope.current,
          {
            y: finalVisualOffset,
          },
          {
            duration: 0,
            ease: 'linear',
          }
        )

        setCurrentSymbolIndex(target)
        hasStoppedRef.current = true

        // Notify sound manager that reel has stopped
        spinSoundManager.stopReel(reelIndex)

        // Stopped at target position
        setTimeout(onStop, 100)
      } else {
        animationFrameRef.current = requestAnimationFrame(animateFrame)
      }
    }
  }

  // Handle animation type changes (transitions)
  useEffect(() => {
    if (
      prevAnimationTypeRef.current !== animationType &&
      isSpinningRef.current &&
      animationStateRef.current
    ) {
      // Transitioning animation type

      // Preserve current state when transitioning
      const currentVelocity = animationStateRef.current.velocity
      const currentOffset = animationStateRef.current.pixelOffset

      // Calculate current symbol position from offset
      const currentPos = Math.abs(Math.round(currentOffset / SYMBOL_HEIGHT)) % symbols.length

      // Initialize new animation but preserve velocity and position
      const newState = animation.init(currentPos, SYMBOL_HEIGHT, direction)
      newState.pixelOffset = currentOffset // Preserve exact position
      newState.velocity = currentVelocity // Maintain velocity exactly to prevent direction changes
      newState.direction = direction // Explicitly preserve direction

      animationStateRef.current = newState
      prevAnimationTypeRef.current = animationType

      // CRITICAL: Always restart animation loop with new callback to avoid stale closures
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Restarting animation loop
      animationFrameRef.current = requestAnimationFrame(timestamp => {
        if (animationStateRef.current) {
          animationStateRef.current.lastFrameTime = timestamp
        }
        animateFrame(timestamp)
      })
    }
  }, [animationType, animation, SYMBOL_HEIGHT, symbols.length, direction, reelIndex])

  // Handle scale changes - reinitialize animation state if spinning
  useEffect(() => {
    if (isSpinningRef.current && animationStateRef.current) {
      // Scale changed, recalculating

      // Preserve velocity but recalculate position based on new SYMBOL_HEIGHT
      const currentVelocity = animationStateRef.current.velocity
      const currentSymbolPos =
        Math.abs(Math.round(currentOffsetRef.current / SYMBOL_HEIGHT)) % symbols.length

      // Reinitialize animation state with new SYMBOL_HEIGHT
      const newState = animationRef.current.init(currentSymbolPos, SYMBOL_HEIGHT, direction)
      newState.velocity = currentVelocity // Preserve velocity
      newState.pixelOffset = -currentSymbolPos * SYMBOL_HEIGHT // Recalculate offset with new height

      animationStateRef.current = newState
      currentOffsetRef.current = newState.pixelOffset

      // Update visual position immediately
      if (scope.current) {
        const middleCopyOffset = -symbols.length * SYMBOL_HEIGHT + REEL_HEIGHT / 2.5
        const visualOffset = newState.pixelOffset + middleCopyOffset

        animate(
          scope.current,
          {
            y: visualOffset,
          },
          {
            duration: 0,
          }
        )
      }
    }
  }, [SYMBOL_HEIGHT, REEL_HEIGHT, gameScale, symbols.length, direction, reelIndex, animate, scope]) // Trigger when scale changes

  // Handle spin start
  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      // Starting spin
      isSpinningRef.current = true
      targetPositionRef.current = null
      hasStoppedRef.current = false

      // Initialize animation state
      animationStateRef.current = animation.init(currentSymbolIndex, SYMBOL_HEIGHT, direction)
      currentOffsetRef.current = animationStateRef.current.pixelOffset
      prevAnimationTypeRef.current = animationType

      // Initialize sound manager for this reel
      spinSoundManager.updateReelState(
        reelIndex,
        animationStateRef.current.velocity || 500,
        true,
        SYMBOL_HEIGHT,
        symbols.length
      )

      // Start animation with timestamp
      animationFrameRef.current = requestAnimationFrame(timestamp => {
        if (animationStateRef.current) {
          animationStateRef.current.lastFrameTime = timestamp
        }
        animateFrame(timestamp)
      })
    }
  }, [
    isSpinning,
    reelIndex,
    currentSymbolIndex,
    animation,
    animate,
    scope,
    symbols.length,
    direction,
    SYMBOL_HEIGHT,
    animationType,
  ])

  // Handle spin stop
  useEffect(() => {
    if (!isSpinning && isSpinningRef.current && targetPosition !== null && targetPosition >= 0) {
      // Targeting new position
      isSpinningRef.current = false
      targetPositionRef.current = targetPosition
    }
  }, [isSpinning, targetPosition, reelIndex])

  // Initialize position on mount and when scale changes
  useEffect(() => {
    if (scope.current) {
      const initialOffset = -currentSymbolIndex * SYMBOL_HEIGHT
      const middleCopyOffset = -symbols.length * SYMBOL_HEIGHT + REEL_HEIGHT / 2.5
      const visualOffset = initialOffset + middleCopyOffset

      animate(
        scope.current,
        {
          y: visualOffset,
        },
        {
          duration: 0,
        }
      )
    }
  }, [scope, animate, currentSymbolIndex, symbols.length, SYMBOL_HEIGHT, REEL_HEIGHT])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Calculate box shadow based on border color alpha
  const borderAlpha = extractAlpha(borderColor || '#1a1a2e')
  const reelBoxShadow = generateBoxShadow(borderAlpha, false)

  return (
    <ReelContainer
      $background={reelBackground}
      $borderColor={borderColor}
      $boxShadow={reelBoxShadow}
      $width={REEL_WIDTH}
      $height={REEL_HEIGHT}
    >
      <motion.div
        ref={scope}
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      >
        {extendedSymbols.map((symbol, index) => {
          // Determine if this symbol is the CENTER symbol in the middle copy
          // The middle copy is at indices symbols.length to symbols.length * 2
          const isInMiddleCopy = index >= symbols.length && index < symbols.length * 2
          const relativePosition = index - symbols.length

          // Check if this is the symbol that's currently at the center (payline)
          // When targetPosition is set, that's the symbol showing at the center
          // We need to check if this symbol's position matches the target
          const isCenterSymbol =
            isInMiddleCopy && relativePosition === (targetPosition ?? currentSymbolIndex)

          return (
            <Symbol
              key={`${index}`}
              symbol={symbol}
              index={index}
              iconSize={iconSize}
              symbolHeight={SYMBOL_HEIGHT}
              isWinning={isWinning && isCenterSymbol && !isSpinning}
              winTier={winTier}
              symbolPosition={0}
            />
          )
        })}
      </motion.div>
      <CenterLine $color={paylineIndicator} $isWinning={isWinning} $winTier={winTier} />
    </ReelContainer>
  )
}
