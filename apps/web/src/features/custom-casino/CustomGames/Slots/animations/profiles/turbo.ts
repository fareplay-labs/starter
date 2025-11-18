// @ts-nocheck
import {
  type AnimationProfile,
  type AnimationState,
  type SpinDirection,
  normalizePosition,
} from '../types'

/**
 * TURBO animation - Fast acceleration with aggressive stopping
 * The original animation with rapid speed-up and mixed physics/position stopping
 */
export const turboAnimation: AnimationProfile = {
  name: 'turbo',
  description: 'Rapid acceleration with aggressive stopping',

  init: (currentPosition: number, symbolHeight: number, direction: SpinDirection = 'forward') => {
    const now = performance.now()
    return {
      velocity: 120, // 120 pixels per second initial speed
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
    // Clamp deltaTime to prevent huge jumps (tab switches, etc)
    const clampedDeltaTime = Math.min(deltaTime, 0.1) // Cap at 100ms

    // Accelerate quickly to max speed (in pixels per second)
    const targetVelocity = 2000 // 1080 pixels per second max @TODO change this to use speed parameter (conditional?)
    const acceleration = 1800 // pixels per second squared
    state.velocity = Math.min(state.velocity + acceleration * clampedDeltaTime, targetVelocity)

    // Move based on velocity and delta time (direction determines sign)
    const directionMultiplier = (direction || state.direction || 'forward') === 'forward' ? -1 : 1
    state.pixelOffset += directionMultiplier * state.velocity * clampedDeltaTime
    state.elapsedFrames++

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

    // Scale thresholds by symbolHeight (assuming base of 60px)
    const scaleFactor = symbolHeight / 60
    const farThreshold = 180 * scaleFactor
    const nearThreshold = 60 * scaleFactor
    const epsilon = 1 // Sub-pixel snap threshold

    // Phase 1: Fast deceleration when far away
    if (state.velocity > 300 && distance > farThreshold) {
      // Still fast and far - decelerate gradually
      const deceleration = 1500 // pixels per second squared
      state.velocity = Math.max(state.velocity - deceleration * clampedDeltaTime, 300)
      const directionMultiplier = dir === 'forward' ? -1 : 1
      const frameDistance = state.velocity * clampedDeltaTime
      const newOffset = currentPixelOffset + directionMultiplier * frameDistance
      return { offset: newOffset, velocity: state.velocity, isComplete: false }
    }

    // Phase 2: Medium speed approach
    if (distance > nearThreshold) {
      // Medium distance - controlled approach
      const targetVelocity = Math.min(240, distance * 4) // Velocity proportional to distance
      state.velocity = targetVelocity
      const directionMultiplier = dir === 'forward' ? -1 : 1
      const frameDistance = Math.min(state.velocity * clampedDeltaTime, distance)
      const newOffset = currentPixelOffset + directionMultiplier * frameDistance
      return { offset: newOffset, velocity: state.velocity, isComplete: false }
    }

    // Phase 3: Final approach with epsilon snap
    if (distance > epsilon) {
      const directionMultiplier = dir === 'forward' ? -1 : 1
      const frameDistance = 120 * clampedDeltaTime // Slow final approach
      if (distance > frameDistance) {
        // Move slowly in the correct direction
        const newOffset = currentPixelOffset + directionMultiplier * frameDistance
        return { offset: newOffset, velocity: 120, isComplete: false }
      }
    }

    // Snap to target (within epsilon)
    return { offset: targetPixelOffset, velocity: 0, isComplete: true }
  },
}
