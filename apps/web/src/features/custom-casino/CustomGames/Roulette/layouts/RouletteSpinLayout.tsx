// @ts-nocheck
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { type RouletteLayoutProps } from '../types'
import { getBackgroundType } from '../../shared/utils/backgroundUtils'
import { getImageUrl } from '../../../shared/utils/cropDataUtils'
import CroppedImage from '../../../shared/ui/CroppedImage'
import {
  ResponsiveSpinContainer,
  WheelSVG,
  WheelPointer,
  CircularImageBackground,
  WheelText,
} from '../styles/RouletteSpinStyles'
import {
  ROULETTE_NUMBERS,
  RED_NUMBERS,
  parseGradient,
  isGradientValue,
  getSegmentFill,
  getTextColor,
  formatNumber,
} from '../utils/spinUtils'
import { useContainerDimensions } from '../hooks/useContainerDimensions'
import { useRouletteSound } from '../hooks/useRouletteSound'
import { useRouletteGameStore } from '../RouletteGameStore'

export const RouletteSpinLayout: React.FC<RouletteLayoutProps> = ({
  parameters,
  winningNumber,
  isSpinning,
  gameState,
  onSpinComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<SVGSVGElement>(null)
  const [currentRotation, setCurrentRotation] = useState(0)
  const hasPlayedRef = useRef(false)
  const previousGameStateRef = useRef<string>('IDLE')

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
  const { playSpinStart, playSpinResult, playSpinReset } = useRouletteSound(customSounds)

  // Access game store to get result information
  const lastResult = useRouletteGameStore(state => state.lastResult)

  // Use new parameter system with fallbacks for backward compatibility
  const baseWheelRadius = parameters.wheelRadius || 200
  const spinDuration = parameters.spinDuration || 5000
  const resetDuration = parameters.resetDuration || parameters.winAnimationDuration || 2000
  const wheelAccentColor = parameters.wheelAccentColor || '#ffffff'
  const wheelBackground = parameters.wheelBackground || '#0a0a0a'

  // Calculate responsive scaling based on user's desired wheel size
  // The wheel should scale WITH the wheelRadius parameter, not inversely
  const baseDiameter = baseWheelRadius * 2

  // Calculate max possible size that fits in container
  const availableWidth = containerWidth - 40 // 20px padding each side
  const availableHeight = containerHeight - 40
  const maxPossibleSize = Math.min(availableWidth, availableHeight)

  // If the desired wheel size is larger than what fits, scale it down
  // If the desired wheel size is smaller, keep it at desired size (with reasonable minimum)
  let finalDiameter = baseDiameter
  if (baseDiameter > maxPossibleSize) {
    finalDiameter = maxPossibleSize
  }

  // Ensure minimum size for usability
  const minDiameter = Math.min(200, maxPossibleSize * 0.3)
  finalDiameter = Math.max(minDiameter, finalDiameter)

  const wheelRadius = finalDiameter / 2
  // Scale factor should be 1.0 when using the desired size, and adjust proportionally
  const scaleFactor = finalDiameter / baseDiameter

  // Process wheel background - use getImageUrl to extract URL while preserving crop data
  const wheelBackgroundUrl = getImageUrl(wheelBackground)
  const wheelBackgroundType = getBackgroundType(wheelBackgroundUrl)

  const numbers = ROULETTE_NUMBERS

  // Calculate wheel segments
  const segmentAngle = 360 / numbers.length
  const halfSegmentOffset = segmentAngle / 2 // Offset to align pointer with segment centers
  const radius = wheelRadius * 0.9
  const innerRadius = wheelRadius * 0.7

  const svgSize = wheelRadius * 2
  const svgCenter = svgSize / 2

  // Track if we've already started the current spin to prevent re-triggering
  const spinStartedRef = useRef(false)
  
  // Calculate final rotation when spin starts
  useEffect(() => {
    if (isSpinning && winningNumber !== null && !spinStartedRef.current) {
      // Mark that we've started this spin
      spinStartedRef.current = true
      
      // Mark that the game has been played
      hasPlayedRef.current = true

      // Play spin start sound when transition to playing
      playSpinStart()

      // Calculate the angle where the winning number should stop
      const winningIndex = numbers.indexOf(winningNumber)
      if (winningIndex !== -1) {
        setCurrentRotation(prevRotation => {
          // Calculate exact position where the pointer should land on this number
          // The segments start at -90 degrees (top) and go clockwise, with halfSegmentOffset applied
          // We want to position the center of the winning segment at the top (0 degrees after the -90 offset)
          const segmentStartAngle = winningIndex * segmentAngle
          const segmentCenterAngle = segmentStartAngle + segmentAngle / 2

          // To put the segment center at the top, we need to rotate the wheel so this angle becomes 0
          // Since the wheel renders with -90 degree offset and we've visually shifted segments by halfSegmentOffset,
          // we need to account for both to land the pointer exactly on the segment center
          const targetAngle = -segmentCenterAngle + halfSegmentOffset // Negative because wheel rotates clockwise

          // Add exactly 5 full rotations (1800 degrees) for visual effect
          // Always rotate from current position + multiple full rotations
          const rotationsToAdd = 1800 // 5 full rotations
          const finalRotation = prevRotation + rotationsToAdd + (targetAngle - (prevRotation % 360))
          
          return finalRotation
        })

        // Show result after spin animation
        const timeoutId = setTimeout(() => {
          onSpinComplete?.(winningNumber)
          spinStartedRef.current = false // Reset for next spin
        }, spinDuration)
        
        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId)
      }
    } else if (!isSpinning) {
      // Reset the flag when not spinning
      spinStartedRef.current = false
    }
  }, [
    isSpinning,
    winningNumber,
    numbers,
    segmentAngle,
    spinDuration,
    onSpinComplete,
    playSpinStart,
    halfSegmentOffset,
  ])

  // Handle RESETTING state - smoothly animate back to 0° position via shortest path
  useEffect(() => {
    if (gameState === 'RESETTING') {
      // Get the current position normalized to 0-360° range
      const currentNormalized = currentRotation % 360

      // We want to get back to 0° (starting position between 0 and 26)
      // Calculate the shortest path: either go to 0° or to 360° (which looks the same)
      let targetAngle = 0

      // Choose the shorter path
      if (currentNormalized > 180) {
        // If we're past halfway, it's shorter to go to 360° (equivalent to 0°)
        targetAngle = 360
      } else {
        // If we're in the first half, go directly to 0°
        targetAngle = 0
      }

      // Keep the full rotation count but adjust the final angle
      const fullRotations = Math.floor(currentRotation / 360) * 360
      const finalTargetAngle = fullRotations + targetAngle

      setCurrentRotation(finalTargetAngle)
    }
  }, [currentRotation, gameState, resetDuration])

  // Play result sound when game shows result (ball lands)
  useEffect(() => {
    if (gameState === 'SHOWING_RESULT' && lastResult) {
      // Play sound based on win/loss
      const isWin = lastResult.payout > 0
      playSpinResult(isWin)
    }
  }, [gameState, lastResult, playSpinResult])

  // Play reset sound when returning to idle
  useEffect(() => {
    if (
      gameState === 'IDLE' &&
      hasPlayedRef.current &&
      previousGameStateRef.current === 'RESETTING'
    ) {
      // Only play reset sound if we have played the game before
      // AND we're transitioning from RESETTING to IDLE
      // This prevents sound spam when panel opens/closes
      playSpinReset()
    }

    // Update previous game state
    previousGameStateRef.current = gameState
  }, [gameState, playSpinReset])

  // Reset wheel rotation only when transitioning from RESETTING to IDLE
  useEffect(() => {
    if (gameState === 'IDLE' && previousGameStateRef.current === 'RESETTING') {
      // Reset wheel to initial position after reset animation completes
      setCurrentRotation(0)
    }
  }, [gameState])

  // Generate wheel background fill based on type
  const getWheelBackgroundFill = (): string => {
    switch (wheelBackgroundType) {
      case 'image':
        // Images are now handled by CircularImageBackground component, make SVG transparent
        return 'transparent'
      case 'gradient':
        if (isGradientValue(wheelBackgroundUrl)) {
          return 'url(#wheelBackgroundGradient)'
        }
        return wheelBackgroundUrl
      case 'solid':
      default:
        return wheelBackgroundUrl
    }
  }

  return (
    <ResponsiveSpinContainer ref={containerRef}>
      <div
        style={{
          position: 'relative',
          width: `${finalDiameter}px`,
          height: `${finalDiameter}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WheelPointer $color={parameters.textColor} $scaleFactor={scaleFactor} />

        {/* Circular image background for wheel center */}
        {wheelBackgroundType === 'image' && (
          <CircularImageBackground $radius={innerRadius}>
            <CroppedImage
              key={`wheel-bg-${JSON.stringify(wheelBackground)}`}
              imageData={wheelBackground}
              alt='Wheel Background'
              width='100%'
              height='100%'
            />
          </CircularImageBackground>
        )}

        <WheelSVG
          ref={wheelRef}
          $isSpinning={isSpinning}
          $isResetting={gameState === 'RESETTING'}
          $spinDuration={spinDuration}
          $resetDuration={resetDuration}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{
            transform: `rotate(${currentRotation}deg)`,
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            {/* Individual gradients for each segment */}
            {numbers.map(num => {
              let gradientColorValue: string | null = null

              // Determine which gradient color value to use for this number
              if (num === 0 && isGradientValue(parameters.neutralColor || '#00AA00')) {
                gradientColorValue = parameters.neutralColor || '#00AA00'
              } else if (RED_NUMBERS.includes(num) && isGradientValue(parameters.rouletteColor1)) {
                gradientColorValue = parameters.rouletteColor1
              } else if (
                !RED_NUMBERS.includes(num) &&
                num !== 0 &&
                isGradientValue(parameters.rouletteColor2)
              ) {
                gradientColorValue = parameters.rouletteColor2
              }

              // If this number should have a gradient, create one
              if (gradientColorValue) {
                const { colors, angle, isRadial } = parseGradient(gradientColorValue)
                if (colors.length >= 2) {
                  if (isRadial) {
                    return (
                      <radialGradient
                        key={num}
                        id={`gradient-${num}`}
                        cx='50%'
                        cy='50%'
                        r='65%'
                        gradientUnits='objectBoundingBox'
                      >
                        {colors.map((color: string, index: number) => (
                          <stop
                            key={index}
                            offset={`${(index / (colors.length - 1)) * 100}%`}
                            stopColor={color}
                          />
                        ))}
                      </radialGradient>
                    )
                  } else {
                    // Linear gradient
                    const rotation = angle ? parseFloat(angle.replace('deg', '')) : 0
                    return (
                      <linearGradient
                        key={num}
                        id={`gradient-${num}`}
                        x1='0%'
                        y1='0%'
                        x2='100%'
                        y2='0%'
                        gradientTransform={`rotate(${rotation} 0.5 0.5)`}
                        gradientUnits='objectBoundingBox'
                      >
                        {colors.map((color: string, index: number) => (
                          <stop
                            key={index}
                            offset={`${(index / (colors.length - 1)) * 100}%`}
                            stopColor={color}
                          />
                        ))}
                      </linearGradient>
                    )
                  }
                }
              }
              return null
            })}

            {/* Wheel background gradient if needed */}
            {wheelBackgroundType === 'gradient' &&
              isGradientValue(wheelBackgroundUrl) &&
              (() => {
                const { colors, angle, isRadial } = parseGradient(wheelBackgroundUrl)
                if (colors.length >= 2) {
                  if (isRadial) {
                    return (
                      <radialGradient
                        id='wheelBackgroundGradient'
                        cx='50%'
                        cy='50%'
                        r='50%'
                        gradientUnits='objectBoundingBox'
                      >
                        {colors.map((color: string, index: number) => (
                          <stop
                            key={index}
                            offset={`${(index / (colors.length - 1)) * 100}%`}
                            stopColor={color}
                          />
                        ))}
                      </radialGradient>
                    )
                  } else {
                    const rotation = angle ? parseFloat(angle.replace('deg', '')) : 0
                    return (
                      <linearGradient
                        id='wheelBackgroundGradient'
                        x1='0%'
                        y1='0%'
                        x2='100%'
                        y2='0%'
                        gradientTransform={`rotate(${rotation} 0.5 0.5)`}
                        gradientUnits='objectBoundingBox'
                      >
                        {colors.map((color: string, index: number) => (
                          <stop
                            key={index}
                            offset={`${(index / (colors.length - 1)) * 100}%`}
                            stopColor={color}
                          />
                        ))}
                      </linearGradient>
                    )
                  }
                }
                return null
              })()}
          </defs>

          {/* Background circle for the wheel */}
          <circle
            cx={svgCenter}
            cy={svgCenter}
            r={radius}
            fill={getWheelBackgroundFill()}
            stroke={wheelAccentColor}
            strokeWidth='2'
          />

          {/* Render wheel segments */}
          {numbers.map((num, index) => {
            const startAngle = (index * segmentAngle - 90 - halfSegmentOffset) * (Math.PI / 180) // Start from top with offset
            const endAngle = ((index + 1) * segmentAngle - 90 - halfSegmentOffset) * (Math.PI / 180)

            // Calculate path coordinates
            const x1 = svgCenter + innerRadius * Math.cos(startAngle)
            const y1 = svgCenter + innerRadius * Math.sin(startAngle)
            const x2 = svgCenter + radius * Math.cos(startAngle)
            const y2 = svgCenter + radius * Math.sin(startAngle)
            const x3 = svgCenter + radius * Math.cos(endAngle)
            const y3 = svgCenter + radius * Math.sin(endAngle)
            const x4 = svgCenter + innerRadius * Math.cos(endAngle)
            const y4 = svgCenter + innerRadius * Math.sin(endAngle)

            const largeArcFlag = segmentAngle > 180 ? 1 : 0

            const pathData = [
              `M ${x1} ${y1}`,
              `L ${x2} ${y2}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
              `L ${x4} ${y4}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
              'Z',
            ].join(' ')

            // Calculate text position (center of segment)
            const textAngle =
              (index * segmentAngle + segmentAngle / 2 - 90 - halfSegmentOffset) * (Math.PI / 180)
            const textRadius = (innerRadius + radius) / 2
            const textX = svgCenter + textRadius * Math.cos(textAngle)
            const textY = svgCenter + textRadius * Math.sin(textAngle)

            return (
              <g key={`segment-${num}-${index}`}>
                <path
                  d={pathData}
                  fill={getSegmentFill(num, parameters)}
                  stroke={wheelAccentColor}
                  strokeWidth='1'
                />
                <WheelText
                  x={textX}
                  y={textY}
                  fill={getTextColor(parameters)}
                  transform={`rotate(${index * segmentAngle + segmentAngle / 2 - halfSegmentOffset}, ${textX}, ${textY})`}
                  $wheelRadius={baseWheelRadius}
                >
                  {formatNumber(num)}
                </WheelText>
              </g>
            )
          })}
        </WheelSVG>
      </div>
    </ResponsiveSpinContainer>
  )
}
