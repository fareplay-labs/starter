// @ts-nocheck
/**
 * Mathematical utilities for Crash game calculations
 * Extracted to eliminate duplication between CrashScene and CrashGameStore
 */

/**
 * Exponential curve function: converts time progress to multiplier
 * Creates the characteristic parabolic shape of the crash curve
 *
 * @param timeProgress - Progress through animation (0 to 1)
 * @param maxMultiplier - Maximum multiplier value for the curve
 * @param curveSharpness - Controls curve steepness (default 1.8 for store, 1.2 for scene)
 * @returns Current multiplier value
 */
export const getMultiplierAtTime = (
  timeProgress: number,
  maxMultiplier: number,
  curveSharpness = 1.8
): number => {
  if (timeProgress <= 0) return 0.0
  if (timeProgress >= 1) return maxMultiplier

  // Exponential curve: creates the parabolic shape
  const exponentialProgress =
    (Math.exp(curveSharpness * timeProgress) - 1) / (Math.exp(curveSharpness) - 1)
  return 0.0 + (maxMultiplier - 0.0) * exponentialProgress
}

/**
 * Inverse function: finds time progress that corresponds to a target multiplier
 * Uses binary search for numerical precision
 *
 * @param targetMultiplier - The multiplier value to find time for
 * @param maxMultiplier - Maximum multiplier value for the curve
 * @param curveSharpness - Controls curve steepness (must match getMultiplierAtTime)
 * @returns Time progress (0 to 1) that produces the target multiplier
 */
export const getTimeAtMultiplier = (
  targetMultiplier: number,
  maxMultiplier: number,
  curveSharpness = 1.8
): number => {
  if (targetMultiplier <= 0.0) return 0
  if (targetMultiplier >= maxMultiplier) return 1

  // Binary search to find time that gives target multiplier
  let low = 0
  let high = 1

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2
    const midMultiplier = getMultiplierAtTime(mid, maxMultiplier, curveSharpness)

    if (Math.abs(midMultiplier - targetMultiplier) < 0.001) {
      return mid
    } else if (midMultiplier < targetMultiplier) {
      low = mid
    } else {
      high = mid
    }
  }

  return (low + high) / 2
}

/**
 * Creates mathematically consistent linear scaling for Y-axis positioning
 * Maintains exponential curve shape regardless of scale
 *
 * @param multiplier - Current multiplier value
 * @param maxCurveMultiplier - Maximum multiplier for the curve
 * @returns Normalized value (0 to 1) for consistent linear scaling
 */
export const getSmoothNormalizedMultiplier = (
  multiplier: number,
  maxCurveMultiplier: number
): number => {
  if (multiplier <= 0) return 0
  if (multiplier >= maxCurveMultiplier) return 1

  // Simple linear scaling - preserves mathematical accuracy
  // This ensures the exponential curve maintains its shape at all scales
  return (multiplier - 0) / (maxCurveMultiplier - 0)
}

/**
 * Accelerated time progression - starts slow, accelerates over time
 * Used in game store for animation pacing
 *
 * @param linearTime - Linear time progress (0 to 1)
 * @returns Accelerated time progress with smooth acceleration curve
 */
export const getAcceleratedTimeProgress = (linearTime: number): number => {
  if (linearTime <= 0) return 0
  if (linearTime >= 1) return 1

  // Use a smooth acceleration curve (ease-in-out with more emphasis on acceleration)
  // This makes the multiplier start slow and speed up over time
  const t = linearTime
  return t * t * (3.0 - 2.0 * t) // Smoothstep - provides gentle acceleration
}

/**
 * Modified time mapping for final positioning at ~80% screen coverage
 * Used in game store for screen positioning
 *
 * @param acceleratedTime - Accelerated time progress
 * @returns Screen time progress capped at 80% coverage
 */
export const getScreenTimeProgress = (acceleratedTime: number): number => {
  if (acceleratedTime <= 0) return 0
  if (acceleratedTime >= 1) return 0.8 // Cap at 80% screen coverage

  // Apply deceleration curve for the final approach
  // Fast movement early, slow approach to final position
  const t = acceleratedTime
  return 0.8 * (t * (2.0 - t)) // Ease-out curve scaled to 80%
}

/**
 * Calculate optimal grid intervals based on current scale
 * Provides grid lines at every whole number for consistent visual density
 *
 * @param maxMultiplier - Maximum multiplier for the current scale
 * @returns Array of multiplier values for grid lines
 */
export const calculateGridIntervals = (maxMultiplier: number): number[] => {
  const intervals: number[] = []

  // Show grid lines at every whole number (starting from 1)
  for (let i = 1; i <= Math.floor(maxMultiplier); i++) {
    intervals.push(i)
  }

  return intervals
}

/**
 * Calculate label intervals for Y-axis
 * Shows labels only for specific values: 2, 5, 10, 20, 30, etc.
 *
 * @param maxMultiplier - Maximum multiplier for the current scale
 * @returns Array of multiplier values for labels
 */
export const calculateLabelIntervals = (maxMultiplier: number): number[] => {
  const intervals: number[] = []

  // Always include key multipliers: 1, 2, 5, 10
  const keyMultipliers = [1, 2, 5, 10]

  for (const multiplier of keyMultipliers) {
    if (multiplier <= maxMultiplier) {
      intervals.push(multiplier)
    }
  }

  // Add every 10 after that: 20, 30, 40, etc.
  for (let i = 20; i <= maxMultiplier; i += 10) {
    intervals.push(i)
  }

  return intervals
}

/**
 * Calculate the mathematical direction of the curve at a given point
 * Used for rocket rotation in the scene
 *
 * @param timeProgress - Current time progress (0 to 1)
 * @param maxMultiplier - Maximum multiplier for the curve
 * @param viewportParams - Viewport parameters for screen space conversion
 * @param height - Canvas height
 * @returns Normalized direction vector {x, y}
 */
export const getCurveDirection = (
  timeProgress: number,
  maxMultiplier: number,
  viewportParams: any
): { x: number; y: number } => {
  // Small delta for numerical derivative calculation
  const delta = 0.001

  // Get current and next points on the curve
  const currentMultiplier = getMultiplierAtTime(timeProgress, maxMultiplier, 1.2) // Use scene curve sharpness
  const nextMultiplier = getMultiplierAtTime(Math.min(timeProgress + delta, 1), maxMultiplier, 1.2)

  // Calculate derivatives in coordinate space (not screen space)
  const dTime = delta

  // Convert to screen space for direction calculation
  const { viewportWidth, viewportHeight } = viewportParams

  // Screen space derivatives
  const dX = dTime * viewportWidth // Time is linear on X-axis
  const dY =
    -getSmoothNormalizedMultiplier(nextMultiplier, maxMultiplier) * viewportHeight +
    getSmoothNormalizedMultiplier(currentMultiplier, maxMultiplier) * viewportHeight // Y is inverted

  // Normalize direction vector
  const length = Math.sqrt(dX * dX + dY * dY)
  if (length > 0.001) {
    return { x: dX / length, y: dY / length }
  }
  return { x: 1, y: 0 } // Default to horizontal if no change
}

/**
 * Calculate optimal time intervals for X-axis gridlines
 * Provides linear time spacing that smoothly adjusts density based on multiplier range
 *
 * @param maxMultiplier - Maximum multiplier for the current scale
 * @param _curveSharpness - Curve sharpness parameter (unused, kept for compatibility)
 * @returns Array of time progress values (0 to 1) for vertical grid lines
 */
export const calculateTimeIntervals = (maxMultiplier: number, _curveSharpness = 1.2): number[] => {
  const intervals: number[] = []

  // Calculate smooth spacing factor based on multiplier range
  // Use linear scaling proportional to Y-axis scaling
  const baseMultiplier = 5 // Baseline multiplier range (starting point)
  const scalingFactor = maxMultiplier / baseMultiplier // Linear scaling ratio

  // Base interval size for the baseline range
  const baseInterval = 0.2 // 5 lines at baseline (5x range)

  // Scale interval size linearly - more multiplier range = smaller intervals (more lines)
  const intervalSize = baseInterval / scalingFactor

  // Create evenly spaced linear intervals based on calculated spacing
  let currentTime = intervalSize
  while (currentTime < 1.0) {
    intervals.push(currentTime)
    currentTime += intervalSize
  }

  return intervals
}
