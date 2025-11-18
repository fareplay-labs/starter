// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react'
import styled, { keyframes, css } from 'styled-components'
import type { WinLineResult } from '../utils/winDetection'
import { calculateWinTier } from '../utils/winTiers'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
`

const pulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const PaylineContainer = styled.div<{
  $containerWidth: number
  $containerHeight: number
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$containerWidth}px;
  height: ${props => props.$containerHeight}px;
  pointer-events: none;
  z-index: 10;
`

const Payline = styled.div<{
  $color: string
  $delay: number
  $isWinning: boolean
  $isNearMiss?: boolean
  $winTier?: 'small' | 'medium' | 'large' | 'mega'
}>`
  position: absolute;
  height: ${props => (props.$isWinning ? '3px' : '2px')};
  width: 100%;
  left: 0;
  opacity: 0;
  transform-origin: left center;
  animation:
    ${fadeIn} 0.3s ease-out ${props => props.$delay}s forwards,
    ${props => (props.$isWinning ? pulse : '')} 1.5s ease-in-out ${props => props.$delay + 0.3}s
      infinite;

  ${props =>
    props.$isWinning &&
    css`
      background: ${props.$winTier === 'mega' ?
        `linear-gradient(90deg, 
            transparent, 
            ${props.$color} 10%, 
            #ff00ff 30%, 
            #00ffff 50%, 
            #ffff00 70%, 
            ${props.$color} 90%, 
            transparent)`
      : props.$winTier === 'large' ?
        `linear-gradient(90deg, 
            transparent, 
            ${props.$color} 20%, 
            #ffd700 50%, 
            ${props.$color} 80%, 
            transparent)`
      : `linear-gradient(90deg, 
            transparent 10%, 
            ${props.$color} 30%, 
            ${props.$color} 70%, 
            transparent 90%)`};
      background-size: 200% 100%;
      animation:
        ${fadeIn} 0.3s ease-out ${props.$delay}s forwards,
        ${props.$winTier === 'mega' || props.$winTier === 'large' ? shimmer : pulse}
          ${props.$winTier === 'mega' ? '1s'
          : props.$winTier === 'large' ? '1.5s'
          : '2s'}
          ease-in-out ${props.$delay + 0.3}s infinite;
    `}

  ${props =>
    props.$isNearMiss &&
    css`
      background: linear-gradient(
        90deg,
        transparent 10%,
        rgba(255, 100, 100, 0.3) 30%,
        rgba(255, 100, 100, 0.3) 70%,
        transparent 90%
      );
      opacity: 0.5;
      animation: ${fadeIn} 0.5s ease-out ${props.$delay}s forwards;
    `}
  
  ${props =>
    !props.$isWinning &&
    !props.$isNearMiss &&
    css`
      background: ${props.$color};
      opacity: 0.3;
    `} /* Circles on either side of payline - commented out */
  /* &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => (props.$isWinning ? props.$color : 'transparent')};
    box-shadow: ${props => (props.$isWinning ? `0 0 15px ${props.$color}` : 'none')};
    opacity: ${props => (props.$isWinning ? 1 : 0)};
    transition: opacity 0.3s ease ${props => props.$delay}s;
  }

  &::before {
    left: -25px;
  }

  &::after {
    right: -25px;
  } */
`

// Commented out SymbolHighlight component as it's not being used
// const SymbolHighlight = styled.div<{
//   $x: number
//   $delay: number
//   $size: number
//   $winTier?: 'small' | 'medium' | 'large' | 'mega'
// }>`
//   position: absolute;
//   left: ${props => props.$x - props.$size / 2}px;
//   top: calc(50% - ${props => props.$size / 2}px);
//   width: ${props => props.$size}px;
//   height: ${props => props.$size}px;
//   border: 2px solid #ffd700;
//   border-radius: 8px;
//   opacity: 0;
//   animation:
//     ${fadeIn} 0.3s ease-out ${props => props.$delay}s forwards,
//     ${pulse} 1.5s ease-in-out ${props => props.$delay + 0.3}s infinite;
//   background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
//   pointer-events: none;
//   z-index: 11;

//   ${props =>
//     props.$winTier === 'mega' &&
//     css`
//       border-width: 3px;
//       box-shadow:
//         0 0 20px #ffd700,
//         inset 0 0 20px rgba(255, 215, 0, 0.3);
//     `}
// `

interface WinningPaylinesProps {
  winningLines: WinLineResult[]
  isActive: boolean
  showNearMiss?: boolean
  progressiveReveal?: boolean
  revealDelay?: number // ms between each line reveal
  symbolHighlights?: boolean
  reelWidth?: number
  reelHeight?: number
  gameScale?: number
  iconSize?: number
}

// Define actual payline patterns for 5x3 grid
const PAYLINE_PATTERNS: Record<number, { row: number; positions: number[] }[]> = {
  1: [{ row: 1, positions: [0, 1, 2, 3, 4] }], // Middle row
  2: [{ row: 0, positions: [0, 1, 2, 3, 4] }], // Top row
  3: [{ row: 2, positions: [0, 1, 2, 3, 4] }], // Bottom row
  4: [
    { row: 0, positions: [0] },
    { row: 1, positions: [1] },
    { row: 2, positions: [2] },
    { row: 1, positions: [3] },
    { row: 0, positions: [4] },
  ], // V shape
  5: [
    { row: 2, positions: [0] },
    { row: 1, positions: [1] },
    { row: 0, positions: [2] },
    { row: 1, positions: [3] },
    { row: 2, positions: [4] },
  ], // Inverted V
  6: [
    { row: 1, positions: [0] },
    { row: 0, positions: [1] },
    { row: 0, positions: [2] },
    { row: 0, positions: [3] },
    { row: 1, positions: [4] },
  ], // Top wave
  7: [
    { row: 1, positions: [0] },
    { row: 2, positions: [1] },
    { row: 2, positions: [2] },
    { row: 2, positions: [3] },
    { row: 1, positions: [4] },
  ], // Bottom wave
  8: [
    { row: 0, positions: [0] },
    { row: 0, positions: [1] },
    { row: 1, positions: [2] },
    { row: 2, positions: [3] },
    { row: 2, positions: [4] },
  ], // Diagonal down
  9: [
    { row: 2, positions: [0] },
    { row: 2, positions: [1] },
    { row: 1, positions: [2] },
    { row: 0, positions: [3] },
    { row: 0, positions: [4] },
  ], // Diagonal up
}

export const WinningPaylines: React.FC<WinningPaylinesProps> = ({
  winningLines,
  isActive,
  showNearMiss = false,
  progressiveReveal = true,
  revealDelay = 200,
  symbolHighlights: _symbolHighlights = true,
  reelWidth = 100,
  reelHeight = 300,
  gameScale = 1.0,
  iconSize: _iconSize = 1.0,
}) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [nearMissLines, setNearMissLines] = useState<number[]>([])
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Calculate container dimensions based on 5 reels and game scale
  const REEL_COUNT = 5
  const scaledReelWidth = reelWidth * gameScale
  const scaledReelHeight = reelHeight * gameScale
  const reelGap = 10 * gameScale
  const containerPadding = 20 * gameScale

  // Total width: 5 reels + 4 gaps + padding (no border, we're inside the content)
  const containerWidth =
    scaledReelWidth * REEL_COUNT + reelGap * (REEL_COUNT - 1) + containerPadding * 2
  const containerHeight = scaledReelHeight + containerPadding * 2

  useEffect(() => {
    // Clear existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []

    if (!isActive || winningLines.length === 0) {
      setVisibleLines([])
      setNearMissLines([])
      return
    }

    if (progressiveReveal) {
      // Progressive reveal - show lines one by one
      winningLines.forEach((line, index) => {
        const timeout = setTimeout(() => {
          setVisibleLines(prev => [...prev, line.lineNumber])
        }, index * revealDelay)
        timeoutsRef.current.push(timeout)
      })
    } else {
      // Show all lines at once
      setVisibleLines(winningLines.map(line => line.lineNumber))
    }

    // Simulate near-miss detection (would be calculated based on actual reel positions)
    if (showNearMiss) {
      // For demo: show lines 6 and 7 as near misses if they're not winning
      const winningLineIds = winningLines.map(l => l.lineNumber)
      const potentialNearMiss = [6, 7].filter(id => !winningLineIds.includes(id))
      setNearMissLines(potentialNearMiss)
    }

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [isActive, winningLines, progressiveReveal, revealDelay, showNearMiss])

  const getPaylineStyle = (lineId: number): React.CSSProperties => {
    const pattern = PAYLINE_PATTERNS[lineId]
    if (!pattern || pattern.length === 0) return { top: '50%' }

    // For simple horizontal lines
    if (pattern.every(p => p.row === pattern[0].row)) {
      const row = pattern[0].row
      const topPercent = row * 33.33 + 16.67 // Center of each row in a 3-row grid
      return { top: `${topPercent}%` }
    }

    // For complex patterns, we'll need SVG paths (simplified for now)
    return { top: '50%' }
  }

  // Use centralized win tier calculation
  const getWinTier = (payout: number, betAmount: number) => 
    calculateWinTier(payout, betAmount) || 'small'

  if (!isActive) return null

  return (
    <PaylineContainer $containerWidth={containerWidth} $containerHeight={containerHeight}>
      {/* Render winning paylines */}
      {winningLines.map((line, index) => {
        const isVisible = visibleLines.includes(line.lineNumber)
        if (!isVisible) return null

        const delay = progressiveReveal ? index * (revealDelay / 1000) : 0
        const winTier = getWinTier(line.payout, 1) // Would need actual bet amount
        const style = getPaylineStyle(line.lineNumber)

        return (
          <Payline
            key={`win-${line.lineNumber}`}
            $color='#ffd700'
            $delay={delay}
            $isWinning={true}
            $winTier={winTier}
            style={style}
          />
        )
      })}

      {/* Render near-miss indicators */}
      {showNearMiss &&
        nearMissLines.map((lineId, index) => {
          const delay = progressiveReveal ? (winningLines.length + index) * (revealDelay / 1000) : 0
          const style = getPaylineStyle(lineId)

          return (
            <Payline
              key={`near-${lineId}`}
              $color='rgba(255, 100, 100, 0.5)'
              $delay={delay}
              $isWinning={false}
              $isNearMiss={true}
              style={style}
            />
          )
        })}

      {/* Symbol highlights - if we want to add it back in */}
      {/* {symbolHighlights &&
        winningLines.map((line, lineIndex) => {
          const isVisible = visibleLines.includes(line.lineNumber)
          if (!isVisible) return null

          // For now, only highlight the center payline (lineNumber 1)
          // since we only have center payline wins
          if (line.lineNumber !== 1) return null

          const winTier = getWinTier(line.payout, 1)

          // Calculate positions for each winning reel
          // We need to highlight consecutive symbols from the start
          return Array.from({ length: line.matchCount }, (_, reelIndex) => {
            const delay =
              progressiveReveal ?
                lineIndex * (revealDelay / 1000) + reelIndex * 0.05
              : reelIndex * 0.05

            // Calculate X position based on reel index
            // In a flex container with gap, each reel position is:
            // padding + (index * (reelWidth + gap)) + reelWidth/2
            // No need to account for border since we're positioning relative to the container content
            const reelX =
              containerPadding + reelIndex * (scaledReelWidth + reelGap) + scaledReelWidth / 2

            // Icons are scaled by iconSize: 40px * iconSize for images, 36px * iconSize for emojis
            // Use the larger value (40) to ensure we cover the whole symbol
            const symbolDisplaySize = 40 * iconSize * gameScale
            const highlightSize = symbolDisplaySize

            return (
              <SymbolHighlight
                key={`highlight-${line.lineNumber}-${reelIndex}`}
                $x={reelX}
                $size={highlightSize}
                $delay={delay}
                $winTier={winTier}
              />
            )
          })
        })} */}
    </PaylineContainer>
  )
}
