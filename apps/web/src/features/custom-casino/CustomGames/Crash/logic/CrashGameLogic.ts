// @ts-nocheck
import { type CrashResult, type CrashParameters, CRASH_GAME_CONSTANTS } from '../types'

/**
 * Pure functions for crash game mechanics
 * Extracted to improve testability and reusability
 */

/**
 * Generate a crash multiplier using exponential distribution
 * This creates the characteristic crash game behavior where lower multipliers are more common
 * @param maxMultiplier Maximum possible multiplier
 * @returns The crash multiplier
 */
export const generateCrashMultiplier = (maxMultiplier: number): number => {
  // Use exponential distribution for realistic crash behavior
  // Lower multipliers are much more common than higher ones
  const lambda = 0.5 // Controls the distribution shape
  const random = Math.random()

  // Exponential distribution: -ln(1-random) / lambda
  const exponentialValue = -Math.log(1 - random) / lambda

  // Scale to our range starting from 0.0
  // Allow crashes below 1.0x so house has edge even on 1.01x bets
  const multiplier = 0.0 + (exponentialValue * (maxMultiplier - 0.0)) / 10

  // Clamp to max and round to 2 decimal places
  return Math.min(Number(multiplier.toFixed(2)), maxMultiplier)
}

/**
 * Determine if player cashed out before crash
 * @param cashOutMultiplier Player's target cash out multiplier
 * @param crashMultiplier The actual crash multiplier
 * @returns Whether the player successfully cashed out
 */
export const determineCashOutSuccess = (
  cashOutMultiplier: number,
  crashMultiplier: number
): boolean => {
  return cashOutMultiplier <= crashMultiplier
}

/**
 * Calculate the payout for a crash game
 * @param betAmount The original bet amount
 * @param cashOutMultiplier The multiplier at which player cashed out
 * @param crashMultiplier The actual crash multiplier
 * @param cashedOut Whether the player successfully cashed out
 * @returns The payout amount
 */
export const calculateCrashPayout = (
  betAmount: number,
  cashOutMultiplier: number,
  crashMultiplier: number,
  cashedOut: boolean
): number => {
  if (!cashedOut) {
    return 0 // Player lost
  }

  // Apply 1% house edge
  const houseEdge = 0.01
  const effectiveMultiplier = cashOutMultiplier * (1 - houseEdge)

  return Number((betAmount * effectiveMultiplier).toFixed(2))
}

/**
 * Generate animation curve points for the crash line
 * @param crashMultiplier The final crash multiplier
 * @param duration Animation duration in milliseconds
 * @param steps Number of animation steps
 * @returns Array of multiplier values for animation
 */
export interface CrashAnimationPoint {
  multiplier: number
  timestamp: number
  isComplete: boolean
}

export const generateCrashAnimationCurve = (
  crashMultiplier: number,
  duration: number,
  steps = 100
): CrashAnimationPoint[] => {
  const points: CrashAnimationPoint[] = []

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    const timestamp = progress * duration

    // Use exponential curve for realistic crash line growth
    const multiplier = 0.0 + (crashMultiplier - 0.0) * Math.pow(progress, 0.7)

    points.push({
      multiplier: Number(multiplier.toFixed(2)),
      timestamp,
      isComplete: i === steps,
    })
  }

  return points
}

/**
 * Validate crash game parameters
 * @param params Parameters to validate
 * @returns Validation result with errors if any
 */
export interface CrashValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateCrashParameters = (
  params: Partial<CrashParameters>
): CrashValidationResult => {
  const errors: string[] = []

  if (params.lineThickness !== undefined) {
    if (params.lineThickness < 1 || params.lineThickness > 10) {
      errors.push('Line thickness must be between 1 and 10 pixels')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Create a complete crash game result
 * @param params Game parameters (visual configurations)
 * @param betAmount The bet amount
 * @param numberOfEntries Number of entries
 * @param cashOutMultiplier Player's chosen cash-out multiplier
 * @param forcedCrashMultiplier Optional forced crash multiplier for testing
 * @returns Complete crash result object
 */
export const createCrashResult = (
  params: CrashParameters,
  betAmount: number,
  numberOfEntries: number,
  cashOutMultiplier: number,
  forcedCrashMultiplier?: number
): CrashResult => {
  const crashMultiplier =
    forcedCrashMultiplier ?? generateCrashMultiplier(CRASH_GAME_CONSTANTS.maxMultiplier)
  const cashedOut = determineCashOutSuccess(cashOutMultiplier, crashMultiplier)
  const achievedMultiplier = cashedOut ? cashOutMultiplier : 0
  const payout = calculateCrashPayout(betAmount, cashOutMultiplier, crashMultiplier, cashedOut)

  return {
    timestamp: Date.now(),
    entryAmount: betAmount,
    numberOfEntries,
    payout,
    isWin: cashedOut,
    crashMultiplier,
    cashOutMultiplier: cashedOut ? cashOutMultiplier : null,
    cashedOut,
    achievedMultiplier,
  }
}
