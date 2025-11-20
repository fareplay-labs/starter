// @ts-nocheck
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { type CrashSceneProps } from './types'
import { CrashParticleSystem } from './CrashVisuals/particles'
import { RetroTrail } from './CrashVisuals/RetroTrail'
import { RocketRenderer } from './CrashVisuals/RocketRenderer'
import { getTimeAtMultiplier, getCurveDirection, getSmoothNormalizedMultiplier } from './utils'
import {
  setupCanvas,
  calculateViewportParams,
  drawGridlines,
  drawAxes,
  drawTargetLine,
  drawGridLabels,
  generateCurvePoints,
  drawCrashCurve,
  resetLineStyle,
  type GridConfig,
  type CurveConfig,
  type TextConfig,
} from './rendering'
import { PhysicsSimulation, type PhysicsState } from './physics'
import { FadeEffect, DynamicScaling } from './effects'

export const CrashScene: React.FC<CrashSceneProps> = ({
  width,
  height,
  lineColor,
  backgroundColor,
  gridColor,
  gridTextColor,
  textColor,
  crashColor,
  winColor,
  axesColor,
  lineThickness,
  showGridlines,
  showGridLabels,
  showAxes,
  showTargetLine,
  currentMultiplier,
  crashMultiplier,
  cashOutMultiplier,
  animationState,
  winText,
  lossText,
  particleIntensity,
  rocketAppearance,
  rocketSize,
  rotateTowardsDirection,
  rocketEndingEffect = 'fade',
  scaleFactor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Dynamic Y-axis ceiling (starts at 5×)
  const [displayMax, setDisplayMax] = useState(5)

  // Dynamic rocket size (scales with display range and scaleFactor)
  const [scaledRocketSize, setScaledRocketSize] = useState(rocketSize * scaleFactor)

  // State for particle tracking
  const [currentRocketPoint, setCurrentRocketPoint] = useState<{ x: number; y: number } | null>(
    null
  )
  const [previousRocketPoint, setPreviousRocketPoint] = useState<{ x: number; y: number } | null>(
    null
  )
  const [crashPoint, setCrashPoint] = useState<{ x: number; y: number } | null>(null)

  // State for stable rocket direction tracking
  const [stableDirection, setStableDirection] = useState<{ x: number; y: number }>({ x: 0, y: -1 }) // Point upward by default
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)

  // State for rocket fade out effect
  const [rocketOpacity, setRocketOpacity] = useState(1)

  // State for physics crash effect
  const [physicsState, setPhysicsState] = useState<PhysicsState | null>(null)

  // Physics simulation manager
  const physicsSimulation = useRef<PhysicsSimulation | null>(null)

  // Fade effect manager
  const fadeEffect = useRef<FadeEffect | null>(null)

  // Dynamic scaling manager
  const dynamicScaling = useRef<DynamicScaling | null>(null)

  // Use refs for frequently changing values to avoid circular dependencies
  const currentRocketPointRef = useRef<{ x: number; y: number } | null>(null)
  const stableDirectionRef = useRef<{ x: number; y: number }>({ x: 0, y: -1 })
  const lastUpdateTimeRef = useRef<number>(0)
  const crashPointRef = useRef<{ x: number; y: number } | null>(null)
  const prevAnimationStateRef = useRef(animationState)

  // Initialize effect managers
  useEffect(() => {
    // Initialize fade effect
    fadeEffect.current = new FadeEffect({
      onOpacityChange: setRocketOpacity,
      onFadeComplete: () => {
        // Fade complete - now safe to clear rocket position if we're in idle state
        if (animationState === 'idle') {
          setCurrentRocketPoint(null)
          setPreviousRocketPoint(null)
          setCrashPoint(null)
          setStableDirection({ x: 0, y: -1 })
          setLastUpdateTime(0)

          // Reset refs as well
          currentRocketPointRef.current = null
          stableDirectionRef.current = { x: 0, y: -1 }
          lastUpdateTimeRef.current = 0
          crashPointRef.current = null
        }
      },
    })

    // Initialize physics simulation
    physicsSimulation.current = new PhysicsSimulation(
      {
        onPhysicsStateChange: setPhysicsState,
        onPhysicsComplete: () => {
          // Physics complete
        },
      },
      {
        canvasWidth: width,
        canvasHeight: height,
      }
    )

    // Initialize dynamic scaling
    dynamicScaling.current = new DynamicScaling({
      onDisplayMaxChange: setDisplayMax,
      onRocketSizeChange: setScaledRocketSize,
    })

    // Set the base rocket size for scaling calculations
    dynamicScaling.current.setBaseRocketSize(rocketSize * scaleFactor)

    return () => {
      fadeEffect.current?.stop()
      physicsSimulation.current?.stop()
    }
  }, [width, height, rocketSize, scaleFactor, animationState])

  // Sync refs with state for external consumption
  useEffect(() => {
    currentRocketPointRef.current = currentRocketPoint
  }, [currentRocketPoint])

  useEffect(() => {
    stableDirectionRef.current = stableDirection
  }, [stableDirection])

  useEffect(() => {
    lastUpdateTimeRef.current = lastUpdateTime
  }, [lastUpdateTime])

  useEffect(() => {
    crashPointRef.current = crashPoint
  }, [crashPoint])

  // Handle rocket fade out when crashed
  useEffect(() => {
    if (animationState === 'crashed' || animationState === 'cashedOut') {
      fadeEffect.current?.start()
    } else if (animationState === 'idle') {
      fadeEffect.current?.reset()
    }
  }, [animationState])

  // Handle physics crash effect
  useEffect(() => {
    if (
      (animationState === 'crashed' || animationState === 'cashedOut') &&
      rocketEndingEffect === 'physics' &&
      !physicsSimulation.current?.isInitialized()
    ) {
      // Wait for current rocket point to be available
      const initPhysics = () => {
        if (!currentRocketPoint || !physicsSimulation.current) {
          requestAnimationFrame(initPhysics)
          return
        }

        physicsSimulation.current.start(currentRocketPoint, stableDirection)
      }

      requestAnimationFrame(initPhysics)
    } else if (animationState === 'idle') {
      physicsSimulation.current?.reset()
    }
  }, [animationState, rocketEndingEffect, currentRocketPoint, stableDirection])

  // Update base rocket size when rocketSize or scaleFactor changes
  useEffect(() => {
    const scaledBase = rocketSize * scaleFactor
    dynamicScaling.current?.setBaseRocketSize(scaledBase)
    setScaledRocketSize(scaledBase)
  }, [rocketSize, scaleFactor])

  // Smoothly grow the visible range whenever a larger value is required
  useEffect(() => {
    dynamicScaling.current?.update(displayMax, currentMultiplier, cashOutMultiplier)
  }, [currentMultiplier, cashOutMultiplier, displayMax])

  // Use consistent line color throughout all phases
  const currentLineColor = lineColor

  // Calculate viewport with dynamic scaling using extracted function
  const viewportParams = useMemo(
    () => calculateViewportParams(width, height, displayMax, crashMultiplier, scaleFactor),
    [width, height, displayMax, crashMultiplier, scaleFactor]
  )

  // Calculate current time progress from current multiplier
  const getCurrentTimeProgress = useCallback(() => {
    if (!displayMax || currentMultiplier < 0.0) return 0

    // Find time progress for current multiplier based on visual scale
    // This ensures the curve is drawn correctly within the current viewport
    return getTimeAtMultiplier(currentMultiplier, displayMax, 1.2)
  }, [currentMultiplier, displayMax])

  // Reset particle positions when animation restarts
  useEffect(() => {
    const prevState = prevAnimationStateRef.current

    if (animationState === 'idle') {
      // Only reset rocket position if fade effect is not running
      // This ensures the rocket remains visible during the fade animation
      if (!fadeEffect.current?.isRunning()) {
        setCurrentRocketPoint(null)
        setPreviousRocketPoint(null)
        setCrashPoint(null)
        setStableDirection({ x: 0, y: -1 }) // Reset to default upward-facing direction
        setLastUpdateTime(0)

        // Reset refs as well
        currentRocketPointRef.current = null
        stableDirectionRef.current = { x: 0, y: -1 }
        lastUpdateTimeRef.current = 0
        crashPointRef.current = null
      }

      // Reset zoom for next round using dynamic scaling manager
      dynamicScaling.current?.reset(cashOutMultiplier)
    } else if (animationState === 'rising' && (prevState !== 'rising' || !currentRocketPoint)) {
      // Initialize rocket position when transitioning to rising from any other state
      // or if rocket point is missing
      const viewportParams = calculateViewportParams(
        width,
        height,
        displayMax,
        crashMultiplier,
        scaleFactor
      )
      const { marginLeft, marginBottom } = viewportParams

      // Set initial rocket position at (0, 0) on the graph
      const initialPoint = { x: marginLeft, y: height - marginBottom }
      setCurrentRocketPoint(initialPoint)
      currentRocketPointRef.current = initialPoint
    }

    // Update the previous state ref
    prevAnimationStateRef.current = animationState

    // Don't reset direction during 'crashed', 'cashedOut' states - preserve last direction
  }, [
    animationState,
    cashOutMultiplier,
    width,
    height,
    displayMax,
    crashMultiplier,
    scaleFactor,
    currentRocketPoint,
  ])

  // Draw the crash graph using rendering utilities
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup canvas using extracted utility
    setupCanvas(canvas, ctx, { width, height, backgroundColor })

    // Create configuration objects for rendering utilities
    const gridConfig: GridConfig = {
      showGridlines,
      showAxes,
      gridColor,
      axesColor,
      height,
    }

    const textConfig: TextConfig = {
      showGridLabels,
      gridTextColor,
      textColor,
      crashColor,
      winColor,
      width,
      height,
    }

    const curveConfig: CurveConfig = {
      lineColor: currentLineColor,
      lineThickness: Math.max(1, Math.round(lineThickness * scaleFactor)), // Scale line thickness
      showTargetLine,
      winColor,
      height,
    }

    // Draw grid and axes
    drawGridlines(ctx, viewportParams, gridConfig)
    drawAxes(ctx, viewportParams, gridConfig)

    // Draw target line
    drawTargetLine(ctx, cashOutMultiplier || 0, viewportParams, curveConfig)

    // Reset line style after grid/axes drawing
    resetLineStyle(ctx)

    // Draw grid labels
    drawGridLabels(ctx, viewportParams, cashOutMultiplier, textConfig)

    // Draw the progressive crash curve
    if (crashMultiplier && animationState !== 'idle') {
      const currentTimeProgress = getCurrentTimeProgress()

      // For very small time progress, ensure we have at least one point at origin
      let points = generateCurvePoints(currentTimeProgress, viewportParams, height)

      // If no points or only at start, add the current position based on multiplier
      if (points.length === 0 || (currentTimeProgress === 0 && currentMultiplier >= 0)) {
        const { viewportHeight, marginLeft, marginBottom, maxCurveMultiplier } = viewportParams
        const normalizedMultiplier = getSmoothNormalizedMultiplier(
          currentMultiplier,
          maxCurveMultiplier
        )
        points = [
          {
            x: marginLeft,
            y: height - marginBottom - normalizedMultiplier * viewportHeight,
            multiplier: currentMultiplier,
            timeProgress: 0,
          },
        ]
      }

      if (points.length > 0) {
        // Draw the curve only if we have more than one point
        if (points.length > 1) {
          drawCrashCurve(ctx, points, curveConfig)
        }

        // Handle rocket positioning and direction calculation
        const currentPoint = points[points.length - 1]
        if (currentPoint && !physicsState?.active) {
          // Update rocket point using refs to avoid circular dependencies
          const newRocketPoint = { x: currentPoint.x, y: currentPoint.y }
          setPreviousRocketPoint(currentRocketPointRef.current)
          setCurrentRocketPoint(newRocketPoint)
          currentRocketPointRef.current = newRocketPoint

          // Calculate direction based on curve's mathematical slope
          const curveDirection = getCurveDirection(
            currentTimeProgress,
            viewportParams.maxCurveMultiplier,
            viewportParams
          )

          // Apply smoothing to the mathematically calculated direction
          const currentTime = Date.now()
          const timeDelta = Math.max(currentTime - lastUpdateTimeRef.current, 16) // Minimum 16ms (60fps)

          if (lastUpdateTimeRef.current > 0) {
            // Smooth the direction changes for visual stability
            const smoothingFactor = Math.min(timeDelta / 100, 0.2) // Adaptive smoothing

            const smoothedDirection = {
              x:
                stableDirectionRef.current.x * (1 - smoothingFactor) +
                curveDirection.x * smoothingFactor,
              y:
                stableDirectionRef.current.y * (1 - smoothingFactor) +
                curveDirection.y * smoothingFactor,
            }

            // Normalize the smoothed direction
            const length = Math.sqrt(
              smoothedDirection.x * smoothedDirection.x + smoothedDirection.y * smoothedDirection.y
            )
            if (length > 0.001) {
              const newDirection = {
                x: smoothedDirection.x / length,
                y: smoothedDirection.y / length,
              }
              setStableDirection(newDirection)
              stableDirectionRef.current = newDirection
            }
          } else {
            // First time - use curve direction directly
            setStableDirection(curveDirection)
            stableDirectionRef.current = curveDirection
          }

          setLastUpdateTime(currentTime)
          lastUpdateTimeRef.current = currentTime
        }

        // Set crash point when crashed OR when cashed out (after play until crash)
        if ((animationState === 'crashed' || animationState === 'cashedOut') && crashMultiplier) {
          const lastPoint = points[points.length - 1]
          if (lastPoint && !crashPointRef.current) {
            const newCrashPoint = { x: lastPoint.x, y: lastPoint.y }
            setCrashPoint(newCrashPoint)
            crashPointRef.current = newCrashPoint
          }
        }
      }
    }

    // No need to trigger animation complete here - it's handled elsewhere
  }, [
    width,
    height,
    backgroundColor,
    gridColor,
    axesColor,
    showGridlines,
    showGridLabels,
    showAxes,
    showTargetLine,
    currentMultiplier,
    currentLineColor,
    lineThickness,
    textColor,
    gridTextColor,
    animationState,
    crashMultiplier,
    cashOutMultiplier,
    crashColor,
    winColor,
    viewportParams,
    getCurrentTimeProgress,
    winText,
    lossText,
    physicsState?.active,
    scaleFactor,
  ])

  // Determine text color for multiplier
  let multiplierColor = textColor
  if (animationState === 'cashedOut') {
    multiplierColor = winColor
  } else if (animationState === 'crashed') {
    multiplierColor = crashColor
  }

  // Scale for emphasis states
  const isEmphasisState = animationState === 'crashed' || animationState === 'cashedOut'
  const textScale = isEmphasisState ? 1.2 : 1.0

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Text container for multiplier and state text */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: `translateX(-50%)`,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Multiplier display */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            fontFamily: 'gohu, monospace',
            color: multiplierColor,
            textShadow: '2px 2px 0px #000000',
            transform: `scale(${textScale})`,
            transition: isEmphasisState ? 'none' : 'transform 0.1s ease-out',
            whiteSpace: 'nowrap',
          }}
        >
          {currentMultiplier.toFixed(2)}x
        </div>

        {/* Game state text positioned below multiplier */}
        {(animationState === 'crashed' || animationState === 'cashedOut') && (
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'gohu, monospace',
              color: animationState === 'cashedOut' ? winColor : crashColor,
              textShadow: '2px 2px 0px #000000',
              transform: `scale(${textScale})`,
              whiteSpace: 'nowrap',
            }}
          >
            {animationState === 'cashedOut' ? winText : lossText}
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
            }}
          />
          {/* Render custom rocket */}
          {(physicsState?.active ||
            (!physicsState?.active &&
              currentRocketPoint &&
              !(
                rocketEndingEffect === 'physics' &&
                (animationState === 'crashed' || animationState === 'cashedOut')
              ))) && (
            <div
              style={{
                opacity: rocketEndingEffect === 'fade' && !physicsState?.active ? rocketOpacity : 1,
                transition:
                  rocketEndingEffect === 'fade' && !physicsState?.active ?
                    'opacity 1s ease-out'
                  : 'none',
              }}
            >
              <RocketRenderer
                x={physicsState?.active ? physicsState.position.x : currentRocketPoint!.x}
                y={physicsState?.active ? physicsState.position.y : currentRocketPoint!.y}
                direction={
                  physicsState?.active ?
                    { x: Math.cos(physicsState.rotation), y: Math.sin(physicsState.rotation) }
                  : stableDirection
                }
                appearance={rocketAppearance}
                size={scaledRocketSize}
                rotateTowardsDirection={rotateTowardsDirection}
              />
            </div>
          )}
          {/* Retro trail effect for rocket */}
          <RetroTrail
            width={width}
            height={height}
            rocketX={currentRocketPoint?.x ?? null}
            rocketY={currentRocketPoint?.y ?? null}
            rocketDirection={stableDirection}
            isActive={animationState === 'cashedOutContinuing'}
            color={lineColor}
            intensity={particleIntensity}
          />
          {/* Particle system for explosions only */}
          <CrashParticleSystem
            width={width}
            height={height}
            animationState={animationState}
            currentPoint={currentRocketPoint}
            previousPoint={previousRocketPoint}
            crashPoint={crashPoint}
            winColor={winColor}
            crashColor={crashColor}
            intensity={particleIntensity}
            rocketDirection={stableDirection}
          />
        </div>
      </div>
    </div>
  )
}
