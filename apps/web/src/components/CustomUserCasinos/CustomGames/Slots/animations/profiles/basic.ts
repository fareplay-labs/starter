// @ts-nocheck
import {
  type AnimationProfile,
  type AnimationState,
  type SpinDirection,
  normalizePosition,
} from '../types'

/**
 * BASIC animation - Pure linear movement
 * Constant velocity, no acceleration, no easing - just straight movement and stop
 */
export const basicAnimation: AnimationProfile = {
  name: 'basic',
  description: 'Linear constant speed spin',

  init: (currentPosition: number, symbolHeight: number, direction: SpinDirection = 'forward') => {
    const now = performance.now()
    return {
      velocity: 600, // 480 pixels per second @TODO change this to use speed parameter (conditional?)
      pixelOffset: -currentPosition * symbolHeight,
      hasStarted: true,
      elapsedFrames: 0,
      startTime: now,
      lastFrameTime: now,
      direction,
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

    // Always constant speed - no acceleration, no easing
    state.velocity = 600 // Constant 480 px/s @TODO change this to use speed parameter (conditional?)
    const directionMultiplier = (direction || state.direction || 'forward') === 'forward' ? -1 : 1
    state.pixelOffset += directionMultiplier * state.velocity * clampedDeltaTime

    // Normalize with modulo instead of while loops
    const wrapBoundary = symbolCount * symbolHeight
    state.pixelOffset = normalizePosition(state.pixelOffset, wrapBoundary)

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
    // Clamp deltaTime to prevent huge jumps
    const clampedDeltaTime = Math.min(deltaTime, 0.1)
    const wrapBoundary = symbolCount * symbolHeight
    const epsilon = 1 // Sub-pixel snap threshold

    // Normalize offsets before calculating distance
    const normalizedCurrent = ((currentPixelOffset % wrapBoundary) + wrapBoundary) % wrapBoundary
    const normalizedTarget = ((targetPixelOffset % wrapBoundary) + wrapBoundary) % wrapBoundary

    // Calculate distance to target based on direction
    const dir = direction || state.direction || 'forward'
    let distance: number

    if (dir === 'forward') {
      // Calculate forward distance to target
      if (normalizedTarget <= normalizedCurrent) {
        // Target is ahead (more negative), direct path
        distance = normalizedCurrent - normalizedTarget
      } else {
        // Target is behind us (less negative), wrap around forward
        distance = normalizedCurrent - normalizedTarget + wrapBoundary
      }
    } else {
      // Calculate backward distance to target
      if (normalizedTarget >= normalizedCurrent) {
        // Target is behind (less negative), direct path
        distance = normalizedTarget - normalizedCurrent
      } else {
        // Target is ahead of us (more negative), wrap around backward
        distance = normalizedTarget - normalizedCurrent + wrapBoundary
      }
    }

    // Check if we're close enough to snap
    if (distance <= epsilon) {
      return { offset: targetPixelOffset, velocity: 0, isComplete: true }
    }

    // Calculate how far we'll move this frame
    const directionMultiplier = dir === 'forward' ? -1 : 1
    const frameDistance = 480 * clampedDeltaTime

    if (distance > frameDistance) {
      // We won't reach the target this frame - keep spinning in the correct direction
      const newOffset = currentPixelOffset + directionMultiplier * frameDistance
      return { offset: newOffset, velocity: 480, isComplete: false }
    } else {
      // We'll reach the target this frame - go directly to target
      return { offset: targetPixelOffset, velocity: 0, isComplete: true }
    }
  },
}
