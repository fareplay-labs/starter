// @ts-nocheck
import {
  type AnimationProfile,
  type AnimationState,
  type SpinDirection,
  normalizePosition,
} from '../types'

/**
 * STEADY STATE animation - Constant speed with slight randomization
 * Used while waiting for blockchain results. No stopping behavior needed.
 * Speed varies slightly to feel organic but maintains smooth motion.
 */
export const steadyAnimation: AnimationProfile = {
  name: 'steady',
  description: 'Steady waiting spin with slight speed variation',

  init: (currentPosition: number, symbolHeight: number, direction: SpinDirection = 'forward') => {
    const now = performance.now()
    // Random base speed between 400-600 px/s for variety
    const baseSpeed = 400 + Math.random() * 200

    return {
      velocity: baseSpeed,
      pixelOffset: -currentPosition * symbolHeight,
      hasStarted: true,
      elapsedFrames: 0,
      startTime: now,
      lastFrameTime: now,
      direction,
      // Store base speed for sine wave modulation
      burstSpeed: baseSpeed,
    }
  },

  updateSpin: (
    state: AnimationState,
    symbolCount: number,
    symbolHeight: number,
    deltaTime: number,
    direction: SpinDirection = 'forward'
  ) => {
    // Clamp deltaTime to prevent huge jumps
    const clampedDeltaTime = Math.min(deltaTime, 0.1)
    state.elapsedFrames++

    // Use sine wave to create subtle speed variations
    const timeInSeconds = (performance.now() - state.startTime) / 1000
    const speedVariation = Math.sin(timeInSeconds * 2) * 50 // ±50 px/s variation

    // Base speed with organic variation
    const baseSpeed = state.burstSpeed || 500
    state.velocity = Math.max(300, baseSpeed + speedVariation) // Never go below 300 px/s

    // Move based on velocity and direction
    const directionMultiplier = (direction || state.direction || 'forward') === 'forward' ? -1 : 1
    state.pixelOffset += directionMultiplier * state.velocity * clampedDeltaTime

    // Wrap around using modulo to maintain infinite looping
    const wrapBoundary = symbolCount * symbolHeight

    // Handle wrapping for both directions
    if (state.pixelOffset > 0) {
      state.pixelOffset = state.pixelOffset - wrapBoundary
    } else if (state.pixelOffset < -wrapBoundary) {
      state.pixelOffset = state.pixelOffset + wrapBoundary
    }

    return state.pixelOffset
  },

  updateStop: (
    state: AnimationState,
    currentPixelOffset: number,
    targetPixelOffset: number,
    symbolCount: number,
    symbolHeight: number,
    deltaTime: number,
    direction: SpinDirection = 'forward'
  ) => {
    // Steady state doesn't stop - it transitions to another animation
    // This method should never be called, but we'll handle it gracefully
    // by continuing to spin at current speed

    const clampedDeltaTime = Math.min(deltaTime, 0.1)
    const dir = direction || state.direction || 'forward'
    const directionMultiplier = dir === 'forward' ? -1 : 1

    // Just keep spinning at current velocity
    const frameDistance = state.velocity * clampedDeltaTime
    const newOffset = currentPixelOffset + directionMultiplier * frameDistance

    // Never complete - this animation doesn't stop
    return { offset: newOffset, velocity: state.velocity, isComplete: false }
  },
}
