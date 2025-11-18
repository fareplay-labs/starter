// @ts-nocheck
import { useCallback, useEffect, useRef } from 'react'
import { usePlinkoGameStore } from '../store/PlinkoGameStore'
import { ANIMATION_CONFIGS, type PlinkoAnimationPreset } from '../types'

/**
 * Advanced animation hooks for Plinko game
 * Provides enhanced animation utilities beyond basic store functionality
 */
export const useAdvancedAnimations = () => {
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(Date.now())

  const store = usePlinkoGameStore()
  const { parameters } = store
  const { animationPreset, ballSpeed, ballTrail } = parameters

  // Animation configuration based on preset
  const animationConfig = ANIMATION_CONFIGS[animationPreset as PlinkoAnimationPreset]

  /**
   * Smooth interpolation for ball positions
   */
  const interpolateBallPosition = useCallback(
    (startPos: { x: number; y: number }, endPos: { x: number; y: number }, progress: number) => {
      const easedProgress = easeInOutCubic(progress)
      return {
        x: startPos.x + (endPos.x - startPos.x) * easedProgress,
        y: startPos.y + (endPos.y - startPos.y) * easedProgress,
      }
    },
    []
  )

  /**
   * Physics-based bounce calculation
   */
  const calculateBounce = useCallback(
    (velocity: number, bounce: number = animationConfig.bounce) => {
      return velocity * bounce * ballSpeed
    },
    [animationConfig.bounce, ballSpeed]
  )

  /**
   * Trail effect calculations for canvas rendering
   */
  const calculateTrailPositions = useCallback(
    (
      currentPosition: { x: number; y: number },
      previousPositions: { x: number; y: number }[],
      maxTrailLength = 8
    ) => {
      if (!ballTrail) return []

      const updatedPositions = [currentPosition, ...previousPositions]
      return updatedPositions.slice(0, maxTrailLength)
    },
    [ballTrail]
  )

  /**
   * Dynamic color interpolation for visual effects
   */
  const interpolateTrailColor = useCallback(
    (baseColor: string, index: number, maxLength: number) => {
      const alpha = Math.max(0.1, 1 - index / maxLength)

      // Convert hex to rgba for alpha blending
      if (baseColor.startsWith('#')) {
        const r = parseInt(baseColor.slice(1, 3), 16)
        const g = parseInt(baseColor.slice(3, 5), 16)
        const b = parseInt(baseColor.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }

      return baseColor
    },
    []
  )

  /**
   * Performance-optimized animation loop
   */
  const startAnimationLoop = useCallback(
    (callback: (deltaTime: number) => void) => {
      const animate = () => {
        const now = Date.now()
        const deltaTime = (now - lastUpdateRef.current) * ballSpeed
        lastUpdateRef.current = now

        callback(deltaTime)
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animate()
    },
    [ballSpeed]
  )

  /**
   * Stop animation loop
   */
  const stopAnimationLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
  }, [])

  /**
   * Enhanced particle effects for ball collisions
   */
  const createCollisionParticles = useCallback(
    (position: { x: number; y: number }, intensity = 1) => {
      const particleCount = Math.floor(5 * intensity)
      const particles = []

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: position.x + (Math.random() - 0.5) * 20,
          y: position.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0,
          decay: 0.02 + Math.random() * 0.03,
        })
      }

      return particles
    },
    []
  )

  /**
   * Sound timing for audio feedback
   */
  const calculateSoundTiming = useCallback(
    (ballIndex: number, currentRow: number) => {
      const baseDelay = 1500 / ballSpeed // Base 1.5s delay adjusted for speed
      const ballDelay = ballIndex * baseDelay
      const rowDelay = currentRow * (animationConfig.duration / 16) // Proportional to total animation time

      return ballDelay + rowDelay
    },
    [animationConfig.duration, ballSpeed]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimationLoop()
    }
  }, [stopAnimationLoop])

  return {
    // Core animation utilities
    interpolateBallPosition,
    calculateBounce,
    calculateTrailPositions,
    interpolateTrailColor,

    // Animation loop control
    startAnimationLoop,
    stopAnimationLoop,

    // Effects
    createCollisionParticles,
    calculateSoundTiming,

    // Configuration
    animationConfig,
    ballSpeed,
    ballTrail,
  }
}

/**
 * Cubic easing function for smooth animations
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Hook for managing ball trail state
 */
export const useBallTrails = () => {
  const trailsRef = useRef<Map<number, { x: number; y: number }[]>>(new Map())

  const updateTrail = useCallback(
    (ballId: number, position: { x: number; y: number }, maxLength = 8) => {
      const currentTrail = trailsRef.current.get(ballId) || []
      const updatedTrail = [position, ...currentTrail].slice(0, maxLength)
      trailsRef.current.set(ballId, updatedTrail)

      return updatedTrail
    },
    []
  )

  const clearTrail = useCallback((ballId: number) => {
    trailsRef.current.delete(ballId)
  }, [])

  const clearAllTrails = useCallback(() => {
    trailsRef.current.clear()
  }, [])

  const getTrail = useCallback((ballId: number) => {
    return trailsRef.current.get(ballId) || []
  }, [])

  return {
    updateTrail,
    clearTrail,
    clearAllTrails,
    getTrail,
  }
}
