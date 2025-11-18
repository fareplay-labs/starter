// @ts-nocheck
import React, { useMemo, useRef, useEffect } from 'react'
import { CrashExplosion } from './CrashExplosion'
import { getDirectionVector } from './utils'
import { type CrashAnimationState } from '../../types'

interface CrashParticleSystemProps {
  width: number
  height: number
  animationState: CrashAnimationState
  currentPoint: { x: number; y: number } | null
  previousPoint: { x: number; y: number } | null
  crashPoint: { x: number; y: number } | null
  winColor: string
  crashColor: string
  intensity?: number // 1-10 scale for particle intensity
  rocketDirection?: { x: number; y: number } // Optional override for direction
}

export const CrashParticleSystem: React.FC<CrashParticleSystemProps> = ({
  width,
  height,
  animationState,
  currentPoint,
  previousPoint,
  crashPoint,
  winColor,
  crashColor,
  intensity = 5,
  rocketDirection,
}) => {
  // Track if we've cashed out to determine explosion color
  const hasCashedOutRef = useRef<boolean>(false)

  // Update cash out tracking
  useEffect(() => {
    if (animationState === 'cashedOutContinuing') {
      hasCashedOutRef.current = true
    } else if (animationState === 'idle') {
      // Only reset when starting a completely new game
      hasCashedOutRef.current = false
    }
  }, [animationState])

  // Calculate rocket direction for explosion
  const rocketDirectionForExplosion = useMemo(() => {
    // Use passed direction if available, otherwise calculate from movement
    if (rocketDirection) {
      return rocketDirection
    }

    if (!currentPoint || !previousPoint) {
      return { x: 1, y: 0 } // Default to right
    }

    return getDirectionVector(previousPoint.x, previousPoint.y, currentPoint.x, currentPoint.y)
  }, [currentPoint, previousPoint, rocketDirection])

  // Determine if explosion should be active
  const explosionActive = animationState === 'crashed' || animationState === 'cashedOut'

  // Determine explosion color - use win color if we cashed out, crash color otherwise
  const explosionColor = hasCashedOutRef.current ? winColor : crashColor

  // Don't render anything if intensity is 0
  if (intensity === 0) {
    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Crash/cashout explosion - explode at crash point */}
      {crashPoint && (
        <CrashExplosion
          isActive={explosionActive}
          explosionX={crashPoint.x}
          explosionY={crashPoint.y}
          rocketDirection={rocketDirectionForExplosion}
          color={explosionColor}
          particleCount={25}
          intensity={intensity}
          width={width}
          height={height}
        />
      )}
    </div>
  )
}
