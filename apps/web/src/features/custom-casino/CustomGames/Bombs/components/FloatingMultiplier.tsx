// @ts-nocheck
import React, { useMemo, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { useBombsGameStore } from '../store/BombsGameStore'
import { bombCountToRevealCountToMultiplier } from '@/features/custom-casino/lib/crypto/bombs'
import { formatEther } from 'viem'

interface MultiplierDisplayProps {
  $color: string
  $isAnimating: boolean
}

const MultiplierDisplay = styled.div<MultiplierDisplayProps>`
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Gohu';
  font-size: 28px;
  font-weight: bold;
  color: ${props => props.$color};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 10;
  transition: color 0.3s ease;

  ${props =>
    props.$isAnimating &&
    `
    animation: bounceScale 0.5s ease-out;
    @keyframes bounceScale {
      0% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.2); }
      100% { transform: translateX(-50%) scale(1); }
    }
  `}
`

export const FloatingMultiplier: React.FC = () => {
  const entry = useBombsGameStore((state: any) => state.entry)
  const gameState = useBombsGameStore((state: any) => state.gameState)
  const lastResult = useBombsGameStore((state: any) => state.lastResult)
  const revealedCells = useBombsGameStore((state: any) => state.revealedCells)
  const bombCells = useBombsGameStore((state: any) => state.bombCells)
  const parameters = useBombsGameStore((state: any) => state.parameters)

  const [isAnimating, setIsAnimating] = useState(false)
  const [displayColor, setDisplayColor] = useState(parameters.textColor || '#FFFFFF')

  // Calculate multiplier
  const multiplier = useMemo(() => {
    const revealCount = entry.side.selectedTiles.length
    const bombCount = entry.side.bombCount

    // Show placeholder when no tiles are selected
    if (revealCount === 0) {
      return '0.00x'
    }

    if (!bombCount || bombCount < 1 || bombCount > 24) {
      return '0.00x'
    }

    const multiplierBigInt = bombCountToRevealCountToMultiplier[bombCount]?.[revealCount]

    if (!multiplierBigInt) {
      return (bombCount > 0 ? (1 + bombCount / 5).toFixed(2) : '0.00') + 'x'
    }

    const multiplierValue = Number(formatEther(multiplierBigInt)).toFixed(2)
    return multiplierValue + 'x'
  }, [entry.side.bombCount, entry.side.selectedTiles])

  // Check for win/loss conditions
  useEffect(() => {
    if (gameState === 'PLAYING' && revealedCells.length > 0) {
      const lastRevealedTile = revealedCells[revealedCells.length - 1]
      const hitBomb = bombCells.includes(lastRevealedTile)

      if (hitBomb) {
        // Loss - first bomb hit
        setDisplayColor(parameters.lossColor || '#FF0000')
        setIsAnimating(true)
      }
    } else if (gameState === 'SHOWING_RESULT' && lastResult) {
      if (lastResult.isWin) {
        // Win - all tiles revealed without bombs
        setDisplayColor(parameters.winColor || '#00FF00')
        setIsAnimating(true)
      }
    } else if (gameState === 'IDLE' || gameState === 'RESETTING') {
      // Reset to default color
      setDisplayColor(parameters.textColor || '#FFFFFF')
    }
  }, [gameState, revealedCells, bombCells, lastResult, parameters])

  // Reset animation state
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  // Trigger animation on multiplier change
  useEffect(() => {
    setIsAnimating(true)
  }, [multiplier])

  return (
    <MultiplierDisplay $color={displayColor} $isAnimating={isAnimating}>
      {multiplier}
    </MultiplierDisplay>
  )
}
