// @ts-nocheck
import {
  type AnimationProfile,
  type AnimationState,
  type SpinDirection,
  normalizePosition,
} from '../types'

/**
 * TEASE animation - Dramatic speed changes for suspense
 * Starts normal, then mega turbo burst, followed by crawl with fake-outs
 */
export const teaseAnimation: AnimationProfile = {
  name: 'tease',
  description: 'Dramatic fake-out spins with mega turbo bursts',

  init: (currentPosition: number, symbolHeight: number, direction: SpinDirection = 'forward') => {
    const now = performance.now()
    return {
      velocity: 600, // Start normal speed
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
    const wrapBoundary = symbolCount * symbolHeight

    // If we should stop and haven't started the sequence yet
    if (state.shouldStop && !state.stopPhase) {
      state.stopPhase = 'mega_burst'
      state.startTime = performance.now() // Reset timer for stop sequence
    }

    // Handle stopping sequence
    if (state.stopPhase && state.stopTarget !== undefined) {
      const timeSinceStopSignal = (performance.now() - state.startTime) / 1000

      // Normalize current and target positions
      const normalizedCurrent = ((state.pixelOffset % wrapBoundary) + wrapBoundary) % wrapBoundary
      const normalizedTarget = ((state.stopTarget % wrapBoundary) + wrapBoundary) % wrapBoundary

      // Calculate distance to target based on direction
      const dir = direction || state.direction || 'forward'
      let distance: number

      if (dir === 'forward') {
        // Calculate forward distance to target
        if (normalizedTarget <= normalizedCurrent) {
          distance = normalizedCurrent - normalizedTarget
        } else {
          distance = normalizedCurrent - normalizedTarget + wrapBoundary
        }
      } else {
        // Calculate backward distance to target
        if (normalizedTarget >= normalizedCurrent) {
          distance = normalizedTarget - normalizedCurrent
        } else {
          distance = normalizedTarget - normalizedCurrent + wrapBoundary
        }
      }

      // Execute stop sequence phases
      if (state.stopPhase === 'mega_burst' && timeSinceStopSignal < 1.5) {
        // MEGA TURBO BURST for 1.5 seconds
        const targetVelocity = 2400
        const acceleration = 4000
        state.velocity = Math.min(state.velocity + acceleration * clampedDeltaTime, targetVelocity)
      } else if (state.stopPhase === 'mega_burst' && timeSinceStopSignal >= 1.5) {
        // Transition to slowdown
        state.stopPhase = 'slowdown'
      } else if (state.stopPhase === 'slowdown' && distance > 360) {
        // Dramatic deceleration
        const targetVelocity = 180
        const deceleration = 3500
        state.velocity = Math.max(state.velocity - deceleration * clampedDeltaTime, targetVelocity)
      } else if (state.stopPhase === 'slowdown' && distance <= 360) {
        // Transition to tease
        state.stopPhase = 'tease'
      } else if (state.stopPhase === 'tease' && distance > 120) {
        // Tease phase - occasional fake-outs
        if (Math.random() < 0.02) {
          // 2% chance per frame for fake-out
          state.velocity = 900 // Fake burst!
        } else if (state.velocity > 150) {
          // Slow back down from fake burst
          const deceleration = 2500
          state.velocity = Math.max(state.velocity - deceleration * clampedDeltaTime, 120)
        } else {
          // Crawl with variations
          state.velocity = 120 + Math.sin(performance.now() / 200) * 30
        }
      } else if (distance <= 120) {
        // Final approach - hand off to updateStop
        return state.pixelOffset // Let updateStop handle the final positioning
      }
    }
    // Normal spinning (no stop signal yet)
    else if (!state.shouldStop) {
      // Just spin at normal speed
      const targetVelocity = 600
      const acceleration = 1200
      if (state.velocity < targetVelocity) {
        state.velocity = Math.min(state.velocity + acceleration * clampedDeltaTime, targetVelocity)
      }
    }

    // Move based on velocity and direction
    const directionMultiplier = (direction || state.direction || 'forward') === 'forward' ? -1 : 1
    state.pixelOffset += directionMultiplier * state.velocity * clampedDeltaTime
    state.elapsedFrames++

    // Normalize with modulo
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
    const clampedDeltaTime = Math.min(deltaTime, 0.1)
    const wrapBoundary = symbolCount * symbolHeight
    const epsilon = 1

    // Initialize stop sequence if not already started
    if (!state.shouldStop) {
      state.shouldStop = true
      state.stopTarget = targetPixelOffset
      state.stopPhase = 'mega_burst'
      state.startTime = performance.now()
      // Add randomness to the animation
      state.burstDuration = 1.0 + Math.random() * 4.0 // 1-5 seconds
      state.burstSpeed = 1500 + Math.random() * 1500 // 1500-3000 px/s
      state.fakeOutCount = 0
      state.maxFakeOuts = Math.floor(Math.random() * 3) + 0 // 0-3 fake-outs
    }

    const timeSinceStopSignal = (performance.now() - state.startTime) / 1000

    // Normalize offsets
    const normalizedCurrent = ((currentPixelOffset % wrapBoundary) + wrapBoundary) % wrapBoundary
    const normalizedTarget = ((targetPixelOffset % wrapBoundary) + wrapBoundary) % wrapBoundary

    // Calculate distance based on direction
    const dir = direction || state.direction || 'forward'
    let distance: number

    if (dir === 'forward') {
      // Calculate forward distance
      if (normalizedTarget <= normalizedCurrent) {
        distance = normalizedCurrent - normalizedTarget
      } else {
        distance = normalizedCurrent - normalizedTarget + wrapBoundary
      }
    } else {
      // Calculate backward distance
      if (normalizedTarget >= normalizedCurrent) {
        distance = normalizedTarget - normalizedCurrent
      } else {
        distance = normalizedTarget - normalizedCurrent + wrapBoundary
      }
    }

    // Execute tease sequence phases
    if (state.stopPhase === 'mega_burst') {
      if (timeSinceStopSignal < (state.burstDuration || 1.5)) {
        // MEGA TURBO BURST with random duration and speed
        const targetVelocity = state.burstSpeed || 2400
        const acceleration = 4000
        state.velocity = Math.min(state.velocity + acceleration * clampedDeltaTime, targetVelocity)
        const directionMultiplier = dir === 'forward' ? -1 : 1
        const frameDistance = state.velocity * clampedDeltaTime
        let newOffset = currentPixelOffset + directionMultiplier * frameDistance

        // Normalize position to maintain wrapping
        newOffset = normalizePosition(newOffset, wrapBoundary)

        return { offset: newOffset, velocity: state.velocity, isComplete: false }
      } else {
        state.stopPhase = 'slowdown'
      }
    }

    if (state.stopPhase === 'slowdown') {
      // Random distance threshold for slowdown
      const slowdownThreshold = 300 + Math.random() * 200 // 300-500 pixels
      if (distance > slowdownThreshold) {
        // Dramatic deceleration
        const targetVelocity = 150 + Math.random() * 100 // 150-250 px/s
        const deceleration = 3000 + Math.random() * 1000 // 3000-4000
        state.velocity = Math.max(state.velocity - deceleration * clampedDeltaTime, targetVelocity)
        const directionMultiplier = dir === 'forward' ? -1 : 1
        const frameDistance = state.velocity * clampedDeltaTime
        let newOffset = currentPixelOffset + directionMultiplier * frameDistance

        // Normalize position to maintain wrapping
        newOffset = normalizePosition(newOffset, wrapBoundary)

        return { offset: newOffset, velocity: state.velocity, isComplete: false }
      } else {
        state.stopPhase = 'tease'
        state.lastFakeOutTime = performance.now()
      }
    }

    if (state.stopPhase === 'tease') {
      const teaseThreshold = 80 + Math.random() * 80 // 80-160 pixels
      if (distance > teaseThreshold) {
        const now = performance.now()
        const timeSinceLastFakeOut = (now - (state.lastFakeOutTime || now)) / 1000

        // Check if we should do a fake-out
        const shouldFakeOut =
          (state.fakeOutCount || 0) < (state.maxFakeOuts || 1) &&
          timeSinceLastFakeOut > 0.8 && // Wait at least 0.8 seconds between fake-outs
          Math.random() < 0.3 // 30% chance when conditions are met

        if (shouldFakeOut) {
          // FAKE OUT! Speed back up
          state.velocity = 1200 + Math.random() * 1200 // 1200-2400 px/s
          state.fakeOutCount = (state.fakeOutCount || 0) + 1
          state.lastFakeOutTime = now
          state.stopPhase = 'fake_burst'
        } else {
          // Crawl with variations
          const baseCrawl = 80 + Math.random() * 40 // 80-120 base
          state.velocity = baseCrawl + Math.sin(now / 200) * 20
        }

        const directionMultiplier = dir === 'forward' ? -1 : 1
        const frameDistance = state.velocity * clampedDeltaTime
        let newOffset = currentPixelOffset + directionMultiplier * frameDistance

        // Normalize position to maintain wrapping
        newOffset = normalizePosition(newOffset, wrapBoundary)

        return { offset: newOffset, velocity: state.velocity, isComplete: false }
      } else {
        state.stopPhase = 'final'
      }
    }

    if (state.stopPhase === 'fake_burst') {
      // During fake burst, maintain speed for a bit then slow back down
      const timeSinceFakeOut = (performance.now() - (state.lastFakeOutTime || 0)) / 1000

      if (timeSinceFakeOut < 1 + Math.random() * 2) {
        // Maintain burst speed
        const directionMultiplier = dir === 'forward' ? -1 : 1
        const frameDistance = state.velocity * clampedDeltaTime
        let newOffset = currentPixelOffset + directionMultiplier * frameDistance

        // Normalize position
        newOffset = normalizePosition(newOffset, wrapBoundary)

        return { offset: newOffset, velocity: state.velocity, isComplete: false }
      } else {
        // Return to tease phase
        state.stopPhase = 'tease'
      }
    }

    // Final approach
    if (distance > epsilon) {
      const directionMultiplier = dir === 'forward' ? -1 : 1
      const frameDistance = Math.min(90 * clampedDeltaTime, distance * 0.8)
      const newOffset = currentPixelOffset + directionMultiplier * frameDistance
      return { offset: newOffset, velocity: 90, isComplete: false }
    }

    // Snap to target
    return { offset: targetPixelOffset, velocity: 0, isComplete: true }
  },
}
