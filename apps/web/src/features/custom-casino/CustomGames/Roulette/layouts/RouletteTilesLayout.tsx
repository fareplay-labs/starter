// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { type RouletteLayoutProps } from '../types'
import {
  ResponsiveTilesContainer,
  ZeroTile,
  GridContainer,
  Tile,
} from '../styles/RouletteLayoutStyles'
import { getTileBackground, getTileBorderColor } from '../utils/colorUtils'
import { createSpinSequence } from '../utils/animationUtils'
import { RED_NUMBERS } from '../utils/spinUtils'
import { useContainerDimensions } from '../hooks/useContainerDimensions'
// calculateTilesScaling no longer needed - using direct container-based scaling
import { useRouletteSound } from '../hooks/useRouletteSound'
import { useRouletteGameStore } from '../RouletteGameStore'

export const RouletteTilesLayout: React.FC<RouletteLayoutProps> = ({
  parameters,
  winningNumber,
  isSpinning,
  onSpinComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Track container dimensions for responsive scaling
  const { width: containerWidth, height: containerHeight } = useContainerDimensions(containerRef)

  // Convert flat parameters to nested structure for custom sounds
  const customSounds = useMemo(() => {
    if (!parameters) return undefined
    
    return {
      spinStart: (parameters as any)['customSounds.spinStart'],
      spinResult: (parameters as any)['customSounds.spinResult'],
      spinReset: (parameters as any)['customSounds.spinReset'],
      tileHighlight: (parameters as any)['customSounds.tileHighlight'],
      tilesResult: (parameters as any)['customSounds.tilesResult'],
    }
  }, [parameters])

  // Sound integration
  const { playTileHighlight, playTilesResult } = useRouletteSound(customSounds)

  // Access game store to get result information
  const lastResult = useRouletteGameStore(state => state.lastResult)

  const baseTileSize = parameters.tileSize || 35
  const baseTileSpacing = parameters.tileSpacing || 4
  const tileBorderRadius = Math.max(1, parameters.tileBorderRadius || 8)
  const tileBorderHighlightColor = parameters.tileBorderHighlightColor || '#00ffff'
  const animationPattern = parameters.animationPattern || 'sequential'

  // Use user's exact tile size and spacing - no individual scaling
  const tileSize = baseTileSize
  // Hack: Add 5px to user spacing to account for 3px borders on each side
  // User sees: 1→0 spacing, 2→1 spacing, etc. Actual CSS: 6→6px, 7→7px, etc.
  // Since minimum spacing is now 1, subtract 1 first then add 6
  const tileSpacing = baseTileSpacing - 1 + 6

  // Calculate scale based on tile size only, ignoring spacing variations
  // This prevents larger spacing from making everything appear smaller
  const COLS = 6
  const ROWS = 6
  const EXTRA_ROWS = 1

  // Base grid calculation using minimal spacing for consistent scaling reference
  const baseSpacing = 6 // use 6px (user's 0 setting) as reference
  const baseGridWidth = COLS * tileSize + (COLS - 1) * baseSpacing
  const baseGridHeight = (ROWS + EXTRA_ROWS) * tileSize + ROWS * baseSpacing + baseSpacing

  // Calculate scale factor based on base grid, not actual spacing
  const containerScale = Math.min(
    1,
    (containerWidth - 40) / baseGridWidth, // 40px total padding
    (containerHeight - 40) / baseGridHeight
  )

  const gridNumbers = useMemo(() => Array.from({ length: 37 }, (_, i) => i), [])
  const waterfallOrder = useMemo(
    () => [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
      26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    ],
    []
  )
  const indexMap = useMemo(() => new Map(gridNumbers.map((num, idx) => [num, idx])), [gridNumbers])

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isOurAnimationRunning, setIsOurAnimationRunning] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [localWinningNumber, setLocalWinningNumber] = useState<number | null>(null)
  const [resultSoundPlayed, setResultSoundPlayed] = useState(false)
  const [isOnFinalStep, setIsOnFinalStep] = useState(false)

  const spinRef = useRef<NodeJS.Timeout | null>(null)
  const lastSoundTimeRef = useRef<number>(0)

  // Play sound when tile is highlighted (with consistent timing)
  useEffect(() => {
    if (activeIndex !== null && isOurAnimationRunning) {
      const now = Date.now()
      const minSoundInterval = 80 // Minimum 80ms between sounds for consistency

      if (now - lastSoundTimeRef.current >= minSoundInterval) {
        playTileHighlight()
        lastSoundTimeRef.current = now
      }
    }
  }, [activeIndex, isOurAnimationRunning, playTileHighlight])

  // Play result sound when animation completes (only once per cycle)
  useEffect(() => {
    if (animationComplete && lastResult && localWinningNumber !== null && !resultSoundPlayed) {
      const isWin = lastResult.totalPayout > 0
      playTilesResult(isWin)
      setResultSoundPlayed(true)
    }
  }, [animationComplete, lastResult, localWinningNumber, resultSoundPlayed, playTilesResult])

  const getTileTextColor = (number: number): string => {
    const isZero = number === 0
    const isRed = RED_NUMBERS.includes(number)

    if (isZero) {
      return parameters.textColor || '#ffffff'
    } else if (isRed) {
      return parameters.textColor || '#ffffff'
    } else {
      return parameters.textColor || '#ffffff'
    }
  }

  const spin = useCallback(
    (target: number) => {
      if (spinRef.current) clearTimeout(spinRef.current)

      const sequence = createSpinSequence(
        target,
        animationPattern,
        gridNumbers,
        waterfallOrder,
        indexMap
      )

      if (sequence.length === 0) return

      setAnimationComplete(false)
      setIsOurAnimationRunning(true)
      setLocalWinningNumber(target)
      setResultSoundPlayed(false) // Reset sound flag for new animation
      setIsOnFinalStep(false)

      let currentStep = 0
      const totalDuration = parameters.spinDuration || 5000
      const totalSteps = sequence.length

      // Calculate delay per step to fit within total duration
      const averageStepDelay = totalDuration / totalSteps

      // Create a more dynamic timing with faster start and slower finish
      const getStepDelay = (progress: number): number => {
        if (progress < 0.3) {
          // Fast start - 60% of average speed
          return averageStepDelay * 0.6
        } else if (progress < 0.8) {
          // Steady middle - average speed
          return averageStepDelay
        } else {
          // Slow finish - 200% of average speed to build suspense
          return averageStepDelay * 2.0
        }
      }

      const tick = () => {
        if (currentStep >= sequence.length) {
          setIsOurAnimationRunning(false)
          setActiveIndex(null)
          setAnimationComplete(true)
          setLocalWinningNumber(target)

          // Use resetDuration parameter for result highlighting
          const resetTime = parameters.resetDuration || 2000

          // Delay onSpinComplete until after result highlighting period
          setTimeout(() => {
            onSpinComplete?.(target)
            setAnimationComplete(false)
            setLocalWinningNumber(null)
            setResultSoundPlayed(false) // Reset for next animation
          }, resetTime)

          return
        }

        setActiveIndex(sequence[currentStep])

        // Check if this is the final step
        const isFinalStep = currentStep === sequence.length - 1
        setIsOnFinalStep(isFinalStep)

        currentStep++

        const progress = currentStep / sequence.length
        const delay = getStepDelay(progress)

        spinRef.current = setTimeout(tick, delay)
      }

      tick()
    },
    [
      animationPattern,
      gridNumbers,
      waterfallOrder,
      indexMap,
      onSpinComplete,
      parameters.spinDuration,
      parameters.resetDuration,
    ]
  )

  useEffect(() => {
    if (isSpinning && winningNumber !== null && winningNumber !== undefined) {
      spin(winningNumber)
    }
    // Don't interrupt our animation if isSpinning becomes false - let it complete naturally
  }, [isSpinning, winningNumber, spin])

  useEffect(() => {
    return () => {
      if (spinRef.current) clearTimeout(spinRef.current)
    }
  }, [])

  const getTileProps = (number: number, _index: number) => {
    const isZero = number === 0
    const isRed = RED_NUMBERS.includes(number)
    const isActive = activeIndex === number
    const isWinner = animationComplete && localWinningNumber === number
    const showWinnerHighlight = isActive && localWinningNumber === number && isOnFinalStep

    return {
      key: number,
      $isRed: isRed,
      $isZero: isZero,
      $isActive: isActive && !showWinnerHighlight, // Don't show regular highlight when showing winner highlight
      $isWinner: isWinner || showWinnerHighlight, // Show winner highlight on final step or when animation complete
      $tileSize: tileSize,
      $borderRadius: tileBorderRadius,
      $textColor: getTileTextColor(number),
      $backgroundColor: getTileBackground(number, parameters, RED_NUMBERS),
      $borderHighlightColor: tileBorderHighlightColor,
      $defaultBorderColor: getTileBorderColor(number, parameters, RED_NUMBERS),
      initial: { scale: 1 },
      animate: { scale: isActive ? 1.1 : 1 },
      transition: { duration: 0.1 },
    }
  }

  const getZeroTileProps = () => {
    const isActive = activeIndex === 0
    const isWinner = animationComplete && localWinningNumber === 0
    const showWinnerHighlight = isActive && localWinningNumber === 0 && isOnFinalStep

    return {
      $isActive: isActive && !showWinnerHighlight, // Don't show regular highlight when showing winner highlight
      $isWinner: isWinner || showWinnerHighlight, // Show winner highlight on final step or when animation complete
      $tileSize: tileSize,
      $tileSpacing: tileSpacing,
      $borderRadius: tileBorderRadius,
      $textColor: getTileTextColor(0),
      $backgroundColor: getTileBackground(0, parameters, RED_NUMBERS),
      $borderHighlightColor: tileBorderHighlightColor,
      $defaultBorderColor: getTileBorderColor(0, parameters, RED_NUMBERS),
      initial: { scale: 1 },
      animate: { scale: isActive ? 1.1 : 1 },
      transition: { duration: 0.1 },
    }
  }

  return (
    <ResponsiveTilesContainer ref={containerRef}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${tileSpacing}px`,
          transform: `scale(${containerScale})`,
          transformOrigin: 'center center',
        }}
      >
        <div style={{ transform: 'translateX(3px)' }}>
          <ZeroTile {...getZeroTileProps()}>0</ZeroTile>
        </div>

        <GridContainer $tileSize={tileSize} $tileSpacing={tileSpacing}>
          {Array.from({ length: 36 }, (_, i) => i + 1).map((number, index) => {
            const { key, ...tileProps } = getTileProps(number, index)
            return (
              <Tile key={key} {...tileProps}>
                {number}
              </Tile>
            )
          })}
        </GridContainer>
      </div>
    </ResponsiveTilesContainer>
  )
}
