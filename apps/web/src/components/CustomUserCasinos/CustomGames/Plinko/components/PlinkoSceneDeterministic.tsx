// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import { type PlinkoParameters, type PlinkoEntry, type PlinkoBallState, type PlinkoResult } from '../types'
import { usePlinkoGameStore } from '../store/PlinkoGameStore'
import { AnimationPlayer, getAnimationForOutcome } from '../simulation'
import { type BallAnimation } from '../simulation/types'
import { AUTO_RESET_DELAY } from '../simulation/constants'
import { resolveBucketFill, bucketAnimationManager } from './bucketRenderer'
import { drawPegGrid, type Peg } from './pegRenderer'
import {
  drawMultiplierLabels,
  getMultiplierAreas,
  drawMultiplierTooltip,
  getMultipliersForGame,
  type MultiplierArea,
} from './multiplierRenderer'
import { BallTrailManager, drawBall, clearBallFillCache } from './ballRenderer'
import { entryEvent } from '@/components/CustomUserCasinos/events/entryEvent'

// Responsive scaling styled components
const GridWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`

interface ScaledContainerProps {
  $scale: number
}

const ScaledContainer = styled.div<ScaledContainerProps>`
  transform: scale(${props => props.$scale});
  transform-origin: center;
  position: relative;
`

const GameContent = styled.div`
  width: max-content;
  position: relative;
`

interface PlinkoSceneProps {
  parameters: PlinkoParameters
  entry: PlinkoEntry  // Add entry for gameplay values
  droppedBalls: PlinkoBallState[]
  isDropping: boolean
  gameState: string
  lastResult: PlinkoResult | null
  highlightedBuckets?: number[]
  sounds?: {
    playBucketLanding: (multiplier?: number) => void
  }
}

interface AnimatedBall {
  id: number
  targetBucket: number
  player: AnimationPlayer
  position: { x: number; y: number }
  isComplete: boolean
  appearStartTime?: number
  isVisible: boolean
}

// Constants for layout calculations
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 540
const BOARD_MARGIN = 50
const BOARD_WIDTH = CANVAS_WIDTH - BOARD_MARGIN * 2
const BUCKET_RAISE_OFFSET = 5 // Increase this number to raise buckets higher

// Calculate dynamic layout - moved outside component to prevent infinite loops
const calculateLayout = (rowCount: number) => {
  // Use a fixed playable board height (matches pre-recorded animation dimensions)
  const PLAYABLE_HEIGHT = 500

  const bucketCount = rowCount + 1
  const bucketWidth = BOARD_WIDTH / bucketCount
  const rowHeight = (PLAYABLE_HEIGHT - 120) / (rowCount + 1)

  return {
    bucketWidth,
    bucketCount,
    rowHeight,
    pegRadius: Math.max(3, Math.min(5, 25 / rowCount)),
    ballRadius: Math.max(4, Math.min(7, 30 / rowCount)),
    startY: 60,
    bucketY: PLAYABLE_HEIGHT - 60 - BUCKET_RAISE_OFFSET, // Buckets aligned with original recordings (440px), raised by offset
    bucketHeight: 30,
  }
}

// Generate peg positions - moved outside component to prevent infinite loops
const generatePegs = (rowCount: number, layout: any): Peg[] => {
  const pegList: Peg[] = []

  for (let row = 0; row < rowCount; row++) {
    const pegsInRow = row + 3
    const y = layout.startY + (row + 1) * layout.rowHeight
    const rowWidth = (pegsInRow - 1) * (BOARD_WIDTH / (rowCount + 2))
    const startX = BOARD_MARGIN + (BOARD_WIDTH - rowWidth) / 2
    const pegSpacing = rowWidth / (pegsInRow - 1)

    for (let col = 0; col < pegsInRow; col++) {
      const x = startX + col * pegSpacing
      pegList.push({
        x,
        y,
        radius: layout.pegRadius,
      })
    }
  }

  return pegList
}

export const PlinkoSceneDeterministic: React.FC<PlinkoSceneProps> = ({
  parameters,
  entry,
  droppedBalls,
  gameState,
  highlightedBuckets = [],
  sounds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const [animatedBalls, setAnimatedBalls] = useState<AnimatedBall[]>([])
  // Use ref for ball positions to avoid frequent React state updates
  const ballPositionsRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  // Use ref for current balls to avoid animation loop dependencies
  const currentBallsRef = useRef<AnimatedBall[]>([])
  const [pegs, setPegs] = useState<Peg[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [scale, setScale] = useState(1)
  const [bucketFillCache, setBucketFillCache] = useState<
    Map<string, CanvasGradient | CanvasPattern | string>
  >(new Map())
  const [pegFillCache, setPegFillCache] = useState<
    Map<string, CanvasGradient | CanvasPattern | string>
  >(new Map())
  const [hoveredMultiplier, setHoveredMultiplier] = useState<MultiplierArea | null>(null)
  const ballFillCache = useRef<Map<string, CanvasGradient | CanvasPattern | string>>(new Map())
  const ballTrailManager = useRef(new BallTrailManager())

  // Calculate ball scale for pop-in animation
  const getBallScale = (ball: AnimatedBall): number => {
    if (!ball.isVisible || !ball.appearStartTime) return 0

    const elapsed = performance.now() - ball.appearStartTime
    const animationDuration = 600 // 200ms pop-in animation

    if (elapsed >= animationDuration) return 1

    // Elastic ease-out animation
    const progress = elapsed / animationDuration
    const elasticOut = 1 - Math.pow(1 - progress, 3) * Math.cos(progress * 4 * Math.PI)

    return Math.max(0, elasticOut)
  }

  // Fallback to default parameters if undefined
  const { parameters: storeParameters, highlightBucket, resetGame } = usePlinkoGameStore()
  const safeParameters = parameters || storeParameters
  
  // Use entry values for gameplay parameters
  const rowCount = entry.side.rowCount
  const riskLevel = entry.side.riskLevel

  // Initialize pegs when parameters change
  useEffect(() => {
    if (!safeParameters) return

    const layout = calculateLayout(rowCount)
    const pegList = generatePegs(rowCount, layout)
    setPegs(pegList)
    setIsInitialized(true)
  }, [rowCount])

  // Calculate scale to fit content within container
  useEffect(() => {
    const calculateScale = () => {
      if (!wrapperRef.current || !contentRef.current) return

      const wrapper = wrapperRef.current

      // Get natural size of content (unscaled)
      const contentWidth = CANVAS_WIDTH
      const contentHeight = CANVAS_HEIGHT

      // Get available space
      const wrapperWidth = wrapper.clientWidth
      const wrapperHeight = wrapper.clientHeight

      // Calculate padding based on gameSize parameter (0.5-1.0)
      // Use parameters prop which contains the actual game parameters
      const gameSize = parameters?.gameSize ?? safeParameters?.gameSize ?? 0.85
      
      // Calculate the target size as a percentage of available space
      // gameSize directly controls how much of the container to use
      const targetWidth = wrapperWidth * gameSize
      const targetHeight = wrapperHeight * gameSize

      // Calculate scale to fit the content into the target size
      const scaleX = targetWidth / contentWidth
      const scaleY = targetHeight / contentHeight

      // Use smaller scale to maintain aspect ratio
      const newScale = Math.min(scaleX, scaleY)
      setScale(newScale)
    }

    calculateScale()

    const resizeObserver = new ResizeObserver(calculateScale)
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [parameters?.gameSize, safeParameters?.gameSize])

  // Clear bucket fill cache when bucket color parameters change
  useEffect(() => {
    if (!safeParameters) return

    // Clear cache when bucket color changes to force gradient regeneration
    setBucketFillCache(new Map())
  }, [safeParameters?.bucketColor, rowCount, riskLevel])

  // Clear peg fill cache when peg color parameters change
  useEffect(() => {
    if (!safeParameters) return

    // Clear cache when peg color changes to force gradient regeneration
    setPegFillCache(new Map())
  }, [safeParameters?.pegColor, rowCount])

  // Clear ball fill cache when ball color parameters change
  useEffect(() => {
    if (!safeParameters) return

    // Clear cache when ball color changes to force gradient regeneration
    clearBallFillCache(ballFillCache.current)
  }, [safeParameters?.ballColor])

  // Mouse interaction for multiplier tooltips
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isInitialized || !safeParameters) return

    const handleMouseMove = (event: MouseEvent) => {
      // getBoundingClientRect already accounts for the scale transformation
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width)
      const y = (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)

      // Check if mouse is over any multiplier area
      const layout = calculateLayout(rowCount)
      const multiplierAreas = getMultiplierAreas(safeParameters, entry, layout, BOARD_MARGIN)

      const hoveredArea = multiplierAreas.find(
        area => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height
      )

      setHoveredMultiplier(hoveredArea || null)

      // Change cursor style
      canvas.style.cursor = hoveredArea ? 'pointer' : 'default'
    }

    const handleMouseLeave = () => {
      setHoveredMultiplier(null)
      canvas.style.cursor = 'default'
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isInitialized, rowCount, safeParameters, entry])

  // Handle new balls being dropped
  useEffect(() => {
    if (!isInitialized || !safeParameters || !droppedBalls.length) return

    const newBalls: AnimatedBall[] = []

    droppedBalls.forEach((ballState, index) => {
      // Check if we already have this ball
      const existingBall = animatedBalls.find(ab => ab.id === ballState.id)
      if (existingBall) return

      // Get the target bucket from the ball state
      const targetBucket =
        ballState.finalPosition ?? Math.floor(Math.random() * (rowCount + 1))

      // Get a pre-generated animation for this outcome or use provided one
      const animation: BallAnimation | null =
        (ballState.animation as import('../simulation/types').BallAnimation) ||
        getAnimationForOutcome(rowCount, targetBucket)

      if (!animation) {
        // No animation available - skip this ball
        return
      }

      // Create animation player
      const player = new AnimationPlayer()
      const animatedBall: AnimatedBall = {
        id: ballState.id,
        targetBucket,
        player,
        position: { x: CANVAS_WIDTH / 2, y: 30 },
        isComplete: false,
        isVisible: false,
      }

      // Start the animation with a delay for sequential dropping
      setTimeout(() => {
        // Mark ball as visible and set appear start time
        setAnimatedBalls(prev => {
          const updated = prev.map(ab =>
            ab.id === ballState.id ?
              { ...ab, isVisible: true, appearStartTime: performance.now() }
            : ab
          )
          currentBallsRef.current = updated
          return updated
        })

        player.play(
          animation,
          // On position update
          position => {
            // Update ball trail if enabled (more frequent updates for smoother trails)
            if (safeParameters?.ballTrail) {
              ballTrailManager.current.updateTrail(ballState.id, position)
            }

            // Store position in ref to avoid expensive React state updates
            ballPositionsRef.current.set(ballState.id, position)
          },
          // On complete
          () => {
            // Determine bucket based on final keyframe position
            const lastKF = animation.keyframes[animation.keyframes.length - 1]
            const layout = calculateLayout(rowCount)
            const bucketIndex = Math.max(
              0,
              Math.min(
                layout.bucketCount - 1,
                Math.floor((lastKF.x - BOARD_MARGIN) / layout.bucketWidth)
              )
            )
            highlightBucket(bucketIndex)

            // Trigger bucket animation when ball lands (if animations are enabled)
            if (safeParameters.showBucketAnimations) {
              bucketAnimationManager.startBucketAnimation(bucketIndex, 1.0)
            }

            // Play bucket landing sound with multiplier-based pitch
            if (sounds?.playBucketLanding && safeParameters) {
              const multipliers = getMultipliersForGame(safeParameters.riskLevel, rowCount)
              const multiplierString = multipliers[bucketIndex] || '1x'
              const multiplierValue = parseFloat(multiplierString.replace('x', ''))
              sounds.playBucketLanding(multiplierValue)
            }

            if (bucketIndex !== targetBucket) {
              // Animation bucket mismatch - using actual landing position
            }
            setAnimatedBalls(prev => {
              const updated = prev.map(ab =>
                ab.id === ballState.id ? { ...ab, isComplete: true } : ab
              )
              currentBallsRef.current = updated
              return updated
            })

            // Clear ball trail when complete
            setTimeout(() => ballTrailManager.current.clearTrail(ballState.id), 1000)
          }
        )
      }, index * safeParameters.ballDropDelay) // Use configurable delay between balls

      newBalls.push(animatedBall)
    })

    if (newBalls.length > 0) {
      setAnimatedBalls(prev => {
        const updated = [...prev, ...newBalls]
        currentBallsRef.current = updated
        return updated
      })
    }
  }, [droppedBalls, isInitialized, safeParameters])

  // Clean up completed balls after delay
  useEffect(() => {
    const completedBalls = animatedBalls.filter(ab => ab.isComplete)
    if (completedBalls.length === 0) return

    const timeout = setTimeout(() => {
      // Clean up ball positions from ref when removing balls
      completedBalls.forEach(ball => {
        ballPositionsRef.current.delete(ball.id)
      })
      setAnimatedBalls(prev => {
        const updated = prev.filter(ab => !ab.isComplete)
        currentBallsRef.current = updated
        return updated
      })
    }, 2000)

    return () => clearTimeout(timeout)
  }, [animatedBalls])

  // Animation loop for rendering
  useEffect(() => {
    if (!isInitialized) return

    const animate = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      if (!safeParameters) return

      const layout = calculateLayout(rowCount)

      // Draw pegs
      drawPegGrid(ctx, pegs, safeParameters, pegFillCache)

      // Draw buckets
      drawBuckets(ctx, safeParameters, layout, highlightedBuckets)

      // Draw multiplier labels below buckets
      drawMultiplierLabels(ctx, safeParameters, entry, layout, BOARD_MARGIN)

      // Draw tooltip if hovering over multiplier
      if (hoveredMultiplier) {
        drawMultiplierTooltip(ctx, safeParameters, entry, hoveredMultiplier)
      }

      // Draw animated balls (only when animation is actively playing)
      currentBallsRef.current.forEach(ball => {
        // Only draw if the animation is actively playing (balls disappear when they hit bucket)
        if (ball.player.getIsPlaying() && ball.isVisible) {
          const scale = getBallScale(ball)
          if (scale > 0) {
            // Get current position from ref for better performance
            const currentPosition = ballPositionsRef.current.get(ball.id) || ball.position
            drawBall(
              ctx,
              currentPosition,
              safeParameters,
              layout,
              ballFillCache.current,
              ballTrailManager.current,
              ball.id,
              scale
            )
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    isInitialized,
    safeParameters,
    entry,
    pegs,
    animatedBalls.length, // Only depend on count, not the full array
    highlightedBuckets,
    pegFillCache,
    hoveredMultiplier,
  ])

  // Reset when game resets
  useEffect(() => {
    if (gameState === 'IDLE') {
      // Stop all animations
      animatedBalls.forEach(ball => ball.player.stop())
      setAnimatedBalls([])
      currentBallsRef.current = []
      // Clear ball positions from ref
      ballPositionsRef.current.clear()
      // Clear bucket animations
      bucketAnimationManager.clearAll()
      // Clear all ball trails
      ballTrailManager.current.clearAllTrails()
    }
  }, [gameState])

  // Auto-reset when all balls have completed
  useEffect(() => {
    if (gameState !== 'PLAYING') return

    const allComplete = animatedBalls.length > 0 && animatedBalls.every(ball => ball.isComplete)

    if (allComplete) {
      // Update wallet balance before resetting
      entryEvent.pub('updateBalance')
      
      const timer = setTimeout(() => {
        resetGame()
      }, AUTO_RESET_DELAY)
      return () => clearTimeout(timer)
    }
  }, [gameState, animatedBalls, resetGame])

  const drawBuckets = (
    ctx: CanvasRenderingContext2D,
    params: PlinkoParameters,
    layout: any,
    highlighted: number[]
  ) => {
    const PADDING = 4

    for (let i = 0; i < layout.bucketCount; i++) {
      const rawX = BOARD_MARGIN + i * layout.bucketWidth
      const x = rawX + PADDING / 2
      const width = layout.bucketWidth - PADDING

      // Height scaled to 1/4 of width
      const height = width / 4
      let y = layout.bucketY // keep top the same

      // Apply bucket animation offset if animations are enabled
      if (params.showBucketAnimations) {
        const animationOffset = bucketAnimationManager.getBucketOffset(i)
        y += animationOffset
      }

      // Get bucket fill using the new renderer function
      const bucketFill = resolveBucketFill(ctx, params, i, { x, y, width, height }, bucketFillCache)

      // Draw bucket fill
      ctx.fillStyle = bucketFill as any
      ctx.fillRect(x, y, width, height)

      // Draw outline if bucket is highlighted
      if (highlighted.includes(i)) {
        ctx.strokeStyle = params.bucketOutlineColor
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)
      }
    }
  }

  if (!isInitialized) {
    return (
      <GridWrapper ref={wrapperRef}>
        <div className='text-white'>Initializing Plinko scene...</div>
      </GridWrapper>
    )
  }

  return (
    <GridWrapper ref={wrapperRef}>
      <ScaledContainer $scale={scale}>
        <GameContent ref={contentRef}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className='bg-transparent'
            style={{
              display: 'block',
            }}
          />
        </GameContent>
      </ScaledContainer>
    </GridWrapper>
  )
}
