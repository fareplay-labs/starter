// @ts-nocheck
/**
 * Timing configurations for reel animations
 * All values in milliseconds
 */

export interface TimingConfig {
  // Steady state durations
  minSteadyDuration: number // Minimum time in steady before transition
  maxSteadyDuration: number // Maximum time in steady state

  // Transition timings
  transitionStagger: number // Delay between reel transitions
  transitionDuration: number // How long the transition takes

  // Stop timings
  stopStagger: number // Delay between reel stops
  minStopDelay: number // Minimum delay before first stop
  maxStopDelay: number // Maximum delay for last stop

  // Special effects
  nearMissPause: number // Extra pause for near-miss drama
  cascadeInterval: number // Time between cascade stops
  simultaneousWindow: number // Time window for "simultaneous" stops
}

/**
 * Default timing configuration
 */
export const DEFAULT_TIMING: TimingConfig = {
  // Steady state
  minSteadyDuration: 500,
  maxSteadyDuration: 3000,

  // Transitions
  transitionStagger: 100,
  transitionDuration: 300,

  // Stops
  stopStagger: 500,
  minStopDelay: 1200,
  maxStopDelay: 5000,

  // Effects
  nearMissPause: 1500,
  cascadeInterval: 200,
  simultaneousWindow: 400,
}

/**
 * Fast timing for quick spins
 */
export const FAST_TIMING: TimingConfig = {
  minSteadyDuration: 300,
  maxSteadyDuration: 1500,
  transitionStagger: 50,
  transitionDuration: 200,
  stopStagger: 300,
  minStopDelay: 800,
  maxStopDelay: 2500,
  nearMissPause: 800,
  cascadeInterval: 100,
  simultaneousWindow: 200,
}

/**
 * Dramatic timing for special wins
 */
export const DRAMATIC_TIMING: TimingConfig = {
  minSteadyDuration: 800,
  maxSteadyDuration: 4000,
  transitionStagger: 200,
  transitionDuration: 500,
  stopStagger: 800,
  minStopDelay: 1500,
  maxStopDelay: 7000,
  nearMissPause: 2500,
  cascadeInterval: 350,
  simultaneousWindow: 600,
}

/**
 * Calculate staggered delays for multiple reels
 */
export function calculateStaggeredDelays(
  reelCount: number,
  baseDelay: number,
  stagger: number,
  pattern: 'linear' | 'exponential' | 'reverse' = 'linear'
): number[] {
  const delays: number[] = []

  for (let i = 0; i < reelCount; i++) {
    switch (pattern) {
      case 'linear':
        delays.push(baseDelay + i * stagger)
        break
      case 'exponential':
        delays.push(baseDelay + Math.pow(1.5, i) * stagger)
        break
      case 'reverse':
        delays.push(baseDelay + (reelCount - 1 - i) * stagger)
        break
    }
  }

  return delays
}

/**
 * Calculate dramatic pause timings for near-misses
 */
export function calculateNearMissTimings(
  reelCount: number,
  nearMissReels: number[],
  timing: TimingConfig = DEFAULT_TIMING
): number[] {
  const delays = calculateStaggeredDelays(reelCount, timing.minStopDelay, timing.stopStagger)

  // Add extra pause for near-miss reels
  nearMissReels.forEach(reelIndex => {
    if (reelIndex < delays.length) {
      delays[reelIndex] += timing.nearMissPause

      // Also delay subsequent reels
      for (let i = reelIndex + 1; i < delays.length; i++) {
        delays[i] += timing.nearMissPause
      }
    }
  })

  return delays
}

/**
 * Calculate cascade effect timings
 */
export function calculateCascadeTimings(
  reelCount: number,
  timing: TimingConfig = DEFAULT_TIMING
): number[] {
  return calculateStaggeredDelays(reelCount, timing.minStopDelay, timing.cascadeInterval, 'linear')
}

/**
 * Calculate simultaneous stop timings (small random variations)
 */
export function calculateSimultaneousTimings(
  reelCount: number,
  timing: TimingConfig = DEFAULT_TIMING
): number[] {
  const baseTime = timing.minStopDelay + timing.stopStagger
  const delays: number[] = []

  for (let i = 0; i < reelCount; i++) {
    // Add small random variation within the window
    const variation = (Math.random() - 0.5) * timing.simultaneousWindow
    delays.push(baseTime + variation)
  }

  return delays
}
